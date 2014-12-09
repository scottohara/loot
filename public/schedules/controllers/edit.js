(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("schedules");

	// Declare the Schedule Edit controller
	mod.controller("scheduleEditController", ["$scope", "$modalInstance", "filterFilter", "limitToFilter", "currencyFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule",
		function($scope, $modalInstance, filterFilter, limitToFilter, currencyFilter, payeeModel, securityModel, categoryModel, accountModel, transactionModel, scheduleModel, schedule) {
			// Make the passed schedule available on the scope
			$scope.transaction = angular.extend({
				transaction_type: "Basic",
				next_due_date: moment().format("YYYY-MM-DD")
			}, schedule);

			if (schedule) {
				// When a schedule is passed in, we start out in "Enter Transaction" mode
				//
				// $scope.transaction is bound to the UI, representing the next instance of the scheduled transaction
				// $scope.schedule represents the schedule itself
				//
				// In this mode, changes in the UI affect only the transaction instance (not the schedule itself).
				// On save ('Enter'), $scope.transaction is saved (creating a new instance of the transaction),
				// then $scope.schedule is updated with the next due date and saved
				
				$scope.mode = "Enter Transaction";

				// Deep copy, so that changes to $scope.transaction don't affect $scope.schedule
				$scope.schedule = angular.copy($scope.transaction);

				// Set the transaction id to null, so that on save a new transaction is created
				$scope.transaction.id = null;

				// Default the transaction date to the next due date
				$scope.transaction.transaction_date = $scope.schedule.next_due_date;
			} else {
				// When no schedule is passed in, we start out in "Add Transaction" mode
				//
				// Both $scope.transaction and $scope.schedule point to the same object, representing the schedule itself
				//
				// In this mode, changes in the UI affect the schedule itself
				// On save ('Save'), $scope.schedule is saved

				$scope.mode = "Add Schedule";

				// Both $scope.schedule and $scope.transaction point to the same object
				$scope.schedule = $scope.transaction;
			}

			// Prefetch the payees list so that the cache is populated
			payeeModel.all();

			// List of payees for the typeahead
			$scope.payees = function(filter, limit) {
				return payeeModel.all().then(function(payees) {
					return limitToFilter(filterFilter(payees, filter), limit);
				});
			};

			// List of securities for the typeahead
			$scope.securities = function(filter, limit) {
				return securityModel.all().then(function(securities) {
					return limitToFilter(filterFilter(securities, filter), limit);
				});
			};

			// List of categories for the typeahead
			$scope.categories = function(filter, limit, parent, includeSplits) {
				// If a parent was specified but it doesn't have an id, return an empty array
				if (parent && isNaN(parent.id)) {
					return [];
				}
				
				// If the parent was specified, pass the parent's id
				var parentId = parent ? parent.id : null;

				return categoryModel.all(parentId).then(function(categories) {
					// For the category dropdown, include psuedo-categories that change the transaction type
					if (!parent) {
						if (includeSplits) {
							categories = [
								{ id: "SplitTo", name: "Split To" },
								{ id: "SplitFrom", name: "Split From" },
								{ id: "Payslip", name: "Payslip" },
								{ id: "LoanRepayment", name: "Loan Repayment" }
							].concat(categories);
						}

						categories = [
							{ id: "TransferTo", name: "Transfer To" },
							{ id: "TransferFrom", name: "Transfer From" }
						].concat(categories);
					}

					return limitToFilter(filterFilter(categories, filter), limit);
				});
			};

			// List of investment categories for the typeahead
			$scope.investmentCategories = function(filter, limit) {
				var categories = [
					{ id: "Buy", name: "Buy" },
					{ id: "Sell", name: "Sell" },
					{ id: "DividendTo", name: "Dividend To" },
					{ id: "AddShares", name: "Add Shares" },
					{ id: "RemoveShares", name: "Remove Shares" },
					{ id: "TransferTo", name: "Transfer To" },
					{ id: "TransferFrom", name: "Transfer From" }
				];

				return limitToFilter(filterFilter(categories, filter), limit);
			};

			// Returns true if the passed value is typeof string (and is not empty)
			$scope.isString = function(object) {
				return (typeof object === "string") && object.length > 0;
			};

			// Handler for payee changes
			$scope.payeeSelected = function() {
				// If we're adding a new transaction and an existing payee is selected
				if (!$scope.transaction.id && typeof $scope.transaction.payee === "object") {
					// Get the previous transaction for the payee
					payeeModel.findLastTransaction($scope.transaction.payee.id, $scope.transaction.primary_account.account_type).then($scope.getSubtransactions).then($scope.useLastTransaction);
				}
			};

			// Handler for security changes
			$scope.securitySelected = function() {
				// If we're adding a new transaction and an existing security is selected
				if (!$scope.transaction.id && typeof $scope.transaction.security === "object") {
					// Get the previous transaction for the security
					securityModel.findLastTransaction($scope.transaction.security.id, $scope.transaction.primary_account.account_type).then($scope.getSubtransactions).then($scope.useLastTransaction);
				}
			};

			// Fetches the subtransactions for a transaction
			$scope.getSubtransactions = function(transaction) {
				// If the last transaction was a Split/Loan Repayment/Payslip; fetch the subtransactions
				switch (transaction.transaction_type) {
					case "Split":
					case "LoanRepayment":
					case "Payslip":
						transaction.subtransactions = [];
						return transactionModel.findSubtransactions(transaction.id).then(function(subtransactions) {
							// Strip the subtransaction ids
							transaction.subtransactions = subtransactions.map(function(subtransaction) {
								subtransaction.id = null;
								return subtransaction;
							});
							
							return transaction;
						});
					default:
						return transaction;
				}
			};

			// Merges the details of a previous transaction into the current one
			$scope.useLastTransaction = function(transaction) {
				// Strip the id, primary account, next due date, transaction date, frequency, status and flag
				delete transaction.id;
				delete transaction.primary_account;
				delete transaction.next_due_date;
				delete transaction.transaction_date;
				delete transaction.frequency;
				delete transaction.status;
				delete transaction.flag;

				// Merge the last transaction details into the transaction on the scope
				$scope.transaction = angular.extend($scope.transaction, transaction);

				// If the amount field already focus, re-trigger the focus event handler to format/select the new value
				var amount = $("#amount");
				if (amount.get(0) === document.activeElement) {
					amount.triggerHandler("focus");
				}
			};

			// Handler for category changes
			// (index) is the subtransaction index, or null for the main schedule
			$scope.categorySelected = function(index) {
				var	transaction = isNaN(index) ? $scope.transaction : $scope.transaction.subtransactions[index],
						type,
						direction,
						parentId;

				// Check the category selection
				if (typeof transaction.category === "object") {
					if (isNaN(index)) {
						switch (transaction.category.id) {
							case "TransferTo":
								type = "Transfer";
								direction = "outflow";
								break;

							case "TransferFrom":
								type = "Transfer";
								direction = "inflow";
								break;

							case "SplitTo":
								type = "Split";
								direction = "outflow";
								break;

							case "SplitFrom":
								type = "Split";
								direction = "inflow";
								break;

							case "Payslip":
								type = "Payslip";
								direction = "inflow";
								break;

							case "LoanRepayment":
								type = "LoanRepayment";
								direction = "outflow";
								break;

							default:
								type = "Basic";
								direction = transaction.category.direction;
								break;
						}

						// If we have switched to a Split, Payslip or Loan Repayment and there are currently no subtransactions,
						// create some stubs, copying the current transaction details into the first entry
						switch (type) {
							case "Split":
							case "Payslip":
							case "LoanRepayment":
								if (!transaction.subtransactions) {
									transaction.subtransactions = [
										{
											memo: transaction.memo,
											amount: transaction.amount
										},
										{},
										{},
										{}
									];
								}
								break;
						}
					} else {
						switch (transaction.category.id) {
							case "TransferTo":
								type = "Transfer";
								direction = "outflow";
								break;

							case "TransferFrom":
								type = "Transfer";
								direction = "inflow";
								break;

							default:
								type = "Sub";
								direction = transaction.category.direction;
								break;
						}
					}

					parentId = transaction.category.id;
				}

				// Update the transaction type & direction
				transaction.transaction_type = type || (isNaN(index) ? "Basic" : "Sub");
				transaction.direction = direction || "outflow";

				// Make sure the subcategory is still valid
				if (transaction.subcategory && transaction.subcategory.parent_id !== parentId) {
					transaction.subcategory = null;
				}
			};

			// Handler for investment category changes
			$scope.investmentCategorySelected = function() {
				var	type,
						direction;

				// Check the category selection
				if (typeof $scope.transaction.category === "object") {
					switch ($scope.transaction.category.id) {
						case "TransferTo":
							type = "SecurityTransfer";
							direction = "outflow";
							break;

						case "TransferFrom":
							type = "SecurityTransfer";
							direction = "inflow";
							break;

						case "RemoveShares":
							type = "SecurityHolding";
							direction = "outflow";
							break;

						case "AddShares":
							type = "SecurityHolding";
							direction = "inflow";
							break;

						case "Sell":
							type = "SecurityInvestment";
							direction = "outflow";
							break;

						case "Buy":
							type = "SecurityInvestment";
							direction = "inflow";
							break;

						case "DividendTo":
							type = "Dividend";
							direction = "outflow";
							break;
					}

					// Update the transaction type & direction
					$scope.transaction.transaction_type = type;
					$scope.transaction.direction = direction;
				}
			};

			// Handler for primary account changes
			$scope.primaryAccountSelected = function() {
				if ($scope.account_type && $scope.account_type !== $scope.transaction.primary_account.account_type) {
					$scope.transaction.category = null;
					$scope.transaction.subcategory = null;
				}
				$scope.account_type = $scope.transaction.primary_account.account_type;

				if ($scope.transaction.account && $scope.transaction.primary_account.id === $scope.transaction.account.id) {
					// Primary account and transfer account can't be the same, so clear the transfer account
					$scope.transaction.account = null;
				}
			};

			// Watch the subtransactions array and recalculate the total allocated
			$scope.$watch("transaction.subtransactions", function(newValue, oldValue) {
				if (newValue !== oldValue && $scope.transaction.subtransactions) {
					$scope.totalAllocated = $scope.transaction.subtransactions.reduce(function(total, subtransaction) {
						return total + (Number(subtransaction.amount * (subtransaction.direction === $scope.transaction.direction ? 1 : -1)) || 0);
					}, 0);

					// If we're adding a new transaction, join the subtransaction memos and update the parent memo
					if (!$scope.transaction.id) {
						$scope.memoFromSubtransactions();
					}
				}
			}, true);

			// Joins the subtransaction memos and updates the parent memo
			$scope.memoFromSubtransactions = function() {
				$scope.transaction.memo = $scope.transaction.subtransactions.reduce(function(memo, subtransaction) {
					return memo + (subtransaction.memo ? ("" !== memo ? "; ": "") + subtransaction.memo : "");
				}, "");
			};

			// List of primary accounts for the typeahead
			$scope.primaryAccounts = function(filter, limit) {
				return accountModel.all().then(function(accounts) {
					return limitToFilter(filterFilter(accounts, filter), limit);
				});
			};

			// List of accounts for the typeahead
			$scope.accounts = function(filter, limit) {
				return accountModel.all().then(function(accounts) {
					var accountFilter = {
						name: filter,
						account_type: "!investment"		// exclude investment accounts by default
					};

					// Filter the primary account from the results (can't transfer to self)
					if ($scope.transaction.primary_account) {
						accounts = filterFilter(accounts, {name: "!" + $scope.transaction.primary_account.name});
					}

					// For security transfers, only include investment accounts
					if ("SecurityTransfer" === $scope.transaction.transaction_type) {
						accountFilter.account_type = "investment";
					}

					return limitToFilter(filterFilter(accounts, accountFilter), limit);
				});
			};

			// List of schedule frequencies
			$scope.scheduleFrequencies = {
				Fortnightly: { weeks: 2 },
				Monthly: { months: 1 },
				Quarterly: { months: 3 },
				Yearly: { years: 1 }
			};

			// List of frequencies for the typeahead
			$scope.frequencies = function(filter, limit) {
				return limitToFilter(filterFilter(Object.keys($scope.scheduleFrequencies), filter), limit);
			};

			// Add a new subtransaction
			$scope.addSubtransaction = function() {
				$scope.transaction.subtransactions.push({});
			};

			// Deletes a subtransaction
			$scope.deleteSubtransaction = function(index) {
				$scope.transaction.subtransactions.splice(index, 1);
			};

			// Calculates the next due date
			$scope.calculateNextDue = function() {
				$scope.schedule.next_due_date = moment($scope.schedule.next_due_date).add($scope.scheduleFrequencies[$scope.schedule.frequency]).format("YYYY-MM-DD");

				if ($scope.schedule.overdue_count > 0) {
					$scope.schedule.overdue_count--;
				}
			};

			// Updates the transaction amount and memo when the quantity, price or commission change
			$scope.updateInvestmentDetails = function() {
				if ("SecurityInvestment" === $scope.transaction.transaction_type) {
					$scope.transaction.amount = ($scope.transaction.quantity || 0) * ($scope.transaction.price || 0) - ($scope.transaction.commission || 0);
				}

				// If we're adding a new buy or sell transaction, update the memo with the details
				if (!$scope.transaction.id && "SecurityInvestment" === $scope.transaction.transaction_type) {
					var	quantity = $scope.transaction.quantity > 0 ? $scope.transaction.quantity : "",
							price = $scope.transaction.price > 0 ? " @ " + currencyFilter($scope.transaction.price) : "",
							commission = $scope.transaction.commission > 0 ? " (less " + currencyFilter($scope.transaction.commission) + " commission)" : "";

					$scope.transaction.memo = quantity + price + commission;
				}
			};

			// Switches from Enter Transaction mode to Edit Schedule mode
			$scope.edit = function() {
				$scope.mode = "Edit Schedule";
				$scope.transaction = $scope.schedule;
			};

			// Enter a transaction based on the schedule, update the next due date and close the modal
			$scope.enter = function() {
				$scope.errorMessage = null;
				transactionModel.save($scope.transaction).then(function() {
					// Skip to the next due date
					$scope.skip();
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Skip the next scheduled occurrence, update the next due date and close the modal
			$scope.skip = function() {
				// Calculate the next due date for the schedule
				$scope.calculateNextDue();

				// Update the schedule
				$scope.save(true);
			};

			// Save and close the modal
			$scope.save = function(skipped) {
				$scope.errorMessage = null;
				scheduleModel.save($scope.schedule).then(function(schedule) {
					// Set the skipped property on the schedule
					schedule.skipped = !!skipped;

					// Close the modal
					$modalInstance.close(schedule);
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without saving
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
