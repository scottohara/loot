(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('schedules');

	// Declare the Schedule Edit controller
	mod.controller('scheduleEditController', ['$scope', '$modalInstance', 'filterFilter', 'limitToFilter', 'payeeModel', 'securityModel', 'categoryModel', 'accountModel', 'transactionModel', 'scheduleModel', 'schedule',
		function($scope, $modalInstance, filterFilter, limitToFilter, payeeModel, securityModel, categoryModel, accountModel, transactionModel, scheduleModel, schedule) {
			// Make the passed schedule available on the scope
			$scope.transaction = angular.extend({
				transaction_type: 'Basic',
				next_due_date: moment().format("YYYY-MM-DD"),
				subtransactions: [{},{},{},{}]
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

				// Give the transaction date field initial focus
				$("#transactionDate").focus();
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

				// Give the next due date field initial focus
				$("#nextDueDate").focus();
			}

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
				// If the parent was specified, pass the parent's id (or -1 if no id)
				var parentId = parent ? parent.id || -1 : null;

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
				return (typeof object === 'string') && object.length > 0;
			};

			// Handler for category changes
			// (index) is the subtransaction index, or null for the main schedule
			$scope.categorySelected = function(index) {
				var	transaction = isNaN(index) ? $scope.transaction : $scope.transaction.subtransactions[index],
						type,
						direction,
						parentId;

				// Check the category selection
				if (typeof transaction.category == 'object') {
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
								type = "Basic";
								direction = transaction.category.direction;
								break;
						}
					}

					parentId = transaction.category.id;
				}

				// Update the transaction type & direction
				transaction.transaction_type = type || 'Basic';
				transaction.direction = direction || 'outflow';

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
			};

			// Handler for primary account changes
			$scope.primaryAccountSelected = function() {
				if ($scope.account_type && $scope.account_type !== $scope.transaction.primary_account.account_type) {
					$scope.transaction.category = null;
					$scope.transaction.subcategory = null;
				}
				$scope.account_type = $scope.transaction.primary_account.account_type;
			};

			// Watch the subtransactions array and recalculate the total allocated
			$scope.$watch('transaction.subtransactions', function() {
				$scope.totalAllocated = $scope.transaction.subtransactions.reduce(function(total, subtransaction) {
					return total + (Number(subtransaction.amount * (subtransaction.direction == $scope.transaction.direction ? 1 : -1)) || 0);
				}, 0);
			}, true);

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
						account_type: '!investment'		// exclude investment accounts by default
					};

					// Filter the primary account from the results (can't transfer to self)
					accounts = filterFilter(accounts, {name: "!" + $scope.transaction.primary_account.name});

					// For security transfers, only include investment accounts
					if ('SecurityTransfer' === $scope.transaction.transaction_type) {
						accountFilter.account_type = 'investment';
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
			};

			// Switches from Enter Transaction mode to Edit Schedule mode
			$scope.edit = function() {
				$scope.mode = "Edit Schedule";
				$scope.transaction = $scope.schedule;
			};

			// Enter a transaction based on the schedule, update the next due date and close the modal
			$scope.enter = function() {
				// For SecurityInvestment transactions, recalculate the amount before saving
				if ('SecurityInvestment' === $scope.transaction.transaction_type) {
					$scope.transaction.amount = $scope.transaction.quantity * $scope.transaction.price - $scope.transaction.commission;
				}

				$scope.errorMessage = null;
				transactionModel.save($scope.transaction.primary_account.id, $scope.transaction).then(function() {
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
				$scope.save();
			};

			// Save and close the modal
			$scope.save = function() {
				// For SecurityInvestment transactions, recalculate the amount before saving
				if ('SecurityInvestment' === $scope.schedule.transaction_type) {
					$scope.schedule.amount = $scope.schedule.quantity * $scope.schedule.price - $scope.schedule.commission;
				}

				$scope.errorMessage = null;
				scheduleModel.save($scope.schedule).then(function(schedule) {
					$modalInstance.close(schedule.data);
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
