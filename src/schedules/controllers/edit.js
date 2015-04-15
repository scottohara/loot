(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.controller("ScheduleEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modalInstance", "$timeout", "filterFilter", "limitToFilter", "currencyFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modalInstance, $timeout, filterFilter, limitToFilter, currencyFilter, payeeModel, securityModel, categoryModel, accountModel, transactionModel, scheduleModel, schedule) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.transaction = angular.extend({transaction_type: "Basic", next_due_date: moment().startOf("day").toDate()}, schedule);
		vm.mode = schedule ? "Enter Transaction" : "Add Schedule";	// When schedule is passed, start in "Enter Transaction" mode; otherwise start in "Add Schedule" mode
		vm.schedule = schedule ? angular.copy(vm.transaction) : vm.transaction;	// When schedule is passed, schedule & transaction are different objects; otherwise same object
		vm.loadingLastTransaction = false;
		vm.account_type = undefined;
		vm.totalAllocated = undefined;
		vm.scheduleFrequencies = {Weekly: { weeks: 1 }, Fortnightly: { weeks: 2 }, Monthly: { months: 1 }, Bimonthly: { months: 2 }, Quarterly: { months: 3 }, Yearly: { years: 1 }};
		vm.payees = payees;
		vm.securities = securities;
		vm.categories = categories;
		vm.investmentCategories = investmentCategories;
		vm.isString = isString;
		vm.payeeSelected = payeeSelected;
		vm.securitySelected = securitySelected;
		vm.getSubtransactions = getSubtransactions;
		vm.useLastTransaction = useLastTransaction;
		vm.categorySelected = categorySelected;
		vm.investmentCategorySelected = investmentCategorySelected;
		vm.primaryAccountSelected = primaryAccountSelected;
		vm.memoFromSubtransactions = memoFromSubtransactions;
		vm.primaryAccounts = primaryAccounts;
		vm.accounts = accounts;
		vm.frequencies = frequencies;
		vm.addSubtransaction = addSubtransaction;
		vm.deleteSubtransaction = deleteSubtransaction;
		vm.addUnallocatedAmount = addUnallocatedAmount;
		vm.calculateNextDue = calculateNextDue;
		vm.updateInvestmentDetails = updateInvestmentDetails;
		vm.edit = edit;
		vm.enter = enter;
		vm.skip = skip;
		vm.save = save;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implemenation
		 */
		if (schedule) {
			// Set the transaction id to null, so that on save a new transaction is created
			vm.transaction.id = null;

			// Default the transaction date to the next due date
			vm.transaction.transaction_date = vm.schedule.next_due_date;
		}

		// Set the auto-flag property based on the presence/absence of a flag
		vm.schedule.autoFlag = !!vm.schedule.flag;
		if ("(no memo)" === vm.schedule.flag) {
			vm.schedule.flag = null;
		}

		// Prefetch the payees list so that the cache is populated
		payeeModel.all();

		// List of payees for the typeahead
		function payees(filter, limit) {
			return payeeModel.all().then(function(payees) {
				return limitToFilter(filterFilter(payees, {name: filter}), limit);
			});
		}

		// List of securities for the typeahead
		function securities(filter, limit) {
			return securityModel.all().then(function(securities) {
				return limitToFilter(filterFilter(securities, {name: filter}), limit);
			});
		}

		// List of categories for the typeahead
		function categories(filter, limit, parent, includeSplits) {
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

				return limitToFilter(filterFilter(categories, {name: filter}), limit);
			});
		}

		// List of investment categories for the typeahead
		function investmentCategories(filter, limit) {
			var categories = [
				{ id: "Buy", name: "Buy" },
				{ id: "Sell", name: "Sell" },
				{ id: "DividendTo", name: "Dividend To" },
				{ id: "AddShares", name: "Add Shares" },
				{ id: "RemoveShares", name: "Remove Shares" },
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" }
			];

			return limitToFilter(filterFilter(categories, {name: filter}), limit);
		}

		// Returns true if the passed value is typeof string (and is not empty)
		function isString(object) {
			return (typeof object === "string") && object.length > 0;
		}

		// Handler for payee changes
		function payeeSelected() {
			// If we're adding a new schedule and an existing payee is selected
			if (!vm.transaction.id && typeof vm.transaction.payee === "object" && vm.mode !== "Enter Transaction") {
				// Show the loading indicator
				vm.loadingLastTransaction = true;

				// Get the previous transaction for the payee
				payeeModel.findLastTransaction(vm.transaction.payee.id, vm.transaction.primary_account.account_type).then(vm.getSubtransactions).then(vm.useLastTransaction).then(function() {
					// Hide the loading indicator
					vm.loadingLastTransaction = false;
				});
			}
		}

		// Handler for security changes
		function securitySelected() {
			// If we're adding a new schedule and an existing security is selected
			if (!vm.transaction.id && typeof vm.transaction.security === "object" && vm.mode !== "Enter Transaction") {
				// Show the loading indicator
				vm.loadingLastTransaction = true;

				// Get the previous transaction for the security
				securityModel.findLastTransaction(vm.transaction.security.id, vm.transaction.primary_account.account_type).then(vm.getSubtransactions).then(vm.useLastTransaction).then(function() {
					// Hide the loading indicator
					vm.loadingLastTransaction = false;
				});
			}
		}

		// Fetches the subtransactions for a transaction
		function getSubtransactions(transaction) {
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
		}

		// Merges the details of a previous transaction into the current one
		function useLastTransaction(transaction) {
			// Strip the id, primary account, next due date, transaction date, frequency and status
			delete transaction.id;
			delete transaction.primary_account;
			delete transaction.next_due_date;
			delete transaction.transaction_date;
			delete transaction.frequency;
			delete transaction.status;
			delete transaction.related_status;

			// Retain the schedule's flag (if any), don't overwrite with the previous transaction's flag
			transaction.flag = vm.transaction.flag;

			// Merge the last transaction details into the transaction on the scope
			vm.transaction = angular.extend(vm.transaction, transaction);

			// Depending on which field has focus, re-trigger the focus event handler to format/select the new value
			angular.forEach(angular.element("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo"), function(field) {
				if (field === document.activeElement) {
					$timeout(function() {
						angular.element(field).triggerHandler("focus");
					}, 0);
				}
			});
		}

		// Handler for category changes
		// (index) is the subtransaction index, or null for the main schedule
		function categorySelected(index) {
			var	transaction = isNaN(index) ? vm.transaction : vm.transaction.subtransactions[index],
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
							type = "Subtransfer";
							direction = "outflow";
							break;

						case "TransferFrom":
							type = "Subtransfer";
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
		}

		// Handler for investment category changes
		function investmentCategorySelected() {
			var	type,
					direction;

			// Check the category selection
			if (typeof vm.transaction.category === "object") {
				switch (vm.transaction.category.id) {
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
				vm.transaction.transaction_type = type;
				vm.transaction.direction = direction;
			}
		}

		// Handler for primary account changes
		function primaryAccountSelected() {
			var selectedAccountType = vm.transaction.primary_account && vm.transaction.primary_account.account_type;

			if (vm.account_type && vm.account_type !== selectedAccountType) {
				vm.transaction.category = null;
				vm.transaction.subcategory = null;
			}
			vm.account_type = selectedAccountType;

			if (vm.transaction.account && vm.transaction.primary_account && vm.transaction.primary_account.id === vm.transaction.account.id) {
				// Primary account and transfer account can't be the same, so clear the transfer account
				vm.transaction.account = null;
			}
		}

		// Watch the subtransactions array and recalculate the total allocated
		$scope.$watch(function() {
			return vm.transaction.subtransactions;
		}, function(newValue, oldValue) {
			if (newValue !== oldValue && vm.transaction.subtransactions) {
				vm.totalAllocated = vm.transaction.subtransactions.reduce(function(total, subtransaction) {
					return total + (Number(subtransaction.amount * (subtransaction.direction === vm.transaction.direction ? 1 : -1)) || 0);
				}, 0);

				// If we're adding a new transaction, join the subtransaction memos and update the parent memo
				if (!vm.transaction.id) {
					vm.memoFromSubtransactions();
				}
			}
		}, true);

		// Joins the subtransaction memos and updates the parent memo
		function memoFromSubtransactions() {
			vm.transaction.memo = vm.transaction.subtransactions.reduce(function(memo, subtransaction) {
				return memo + (subtransaction.memo ? ("" !== memo ? "; ": "") + subtransaction.memo : "");
			}, "");
		}

		// List of primary accounts for the typeahead
		function primaryAccounts(filter, limit) {
			return accountModel.all().then(function(accounts) {
				return limitToFilter(filterFilter(accounts, {name: filter}), limit);
			});
		}

		// List of accounts for the typeahead
		function accounts(filter, limit) {
			return accountModel.all().then(function(accounts) {
				var accountFilter = {
					name: filter,
					account_type: "!investment"		// exclude investment accounts by default
				};

				// Filter the primary account from the results (can't transfer to self)
				if (vm.transaction.primary_account) {
					accounts = filterFilter(accounts, {name: "!" + vm.transaction.primary_account.name});
				}

				// For security transfers, only include investment accounts
				if ("SecurityTransfer" === vm.transaction.transaction_type) {
					accountFilter.account_type = "investment";
				}

				return limitToFilter(filterFilter(accounts, accountFilter), limit);
			});
		}

		// List of frequencies for the typeahead
		function frequencies(filter, limit) {
			return limitToFilter(filterFilter(Object.keys(vm.scheduleFrequencies), filter), limit);
		}

		// Add a new subtransaction
		function addSubtransaction() {
			vm.transaction.subtransactions.push({});
		}

		// Deletes a subtransaction
		function deleteSubtransaction(index) {
			vm.transaction.subtransactions.splice(index, 1);
		}

		// Adds any unallocated amount to the specified subtransaction
		function addUnallocatedAmount(index) {
			vm.transaction.subtransactions[index].amount = (Number(vm.transaction.subtransactions[index].amount) || 0) + (vm.transaction.amount - vm.totalAllocated);
		}

		// Calculates the next due date
		function calculateNextDue() {
			vm.schedule.next_due_date = moment(vm.schedule.next_due_date).add(vm.scheduleFrequencies[vm.schedule.frequency]).toDate();

			if (vm.schedule.overdue_count > 0) {
				vm.schedule.overdue_count--;
			}
		}

		// Updates the transaction amount and memo when the quantity, price or commission change
		function updateInvestmentDetails() {
			if ("SecurityInvestment" === vm.transaction.transaction_type) {
				// Base amount is the quantity multiplied by the price
				vm.transaction.amount = (vm.transaction.quantity || 0) * (vm.transaction.price || 0);

				// For a purchase, commission is added to the cost; for a sale, commission is subtracted from the proceeds
				if ("inflow" === vm.transaction.direction) {
					vm.transaction.amount += (vm.transaction.commission || 0);
				} else {
					vm.transaction.amount -= (vm.transaction.commission || 0);
				}
			}

			// If we're adding a new buy or sell transaction, update the memo with the details
			if (!vm.transaction.id && "SecurityInvestment" === vm.transaction.transaction_type) {
				var	quantity = vm.transaction.quantity > 0 ? vm.transaction.quantity : "",
						price = vm.transaction.price > 0 ? " @ " + currencyFilter(vm.transaction.price) : "",
						commission = vm.transaction.commission > 0 ? " (" + ("inflow" === vm.transaction.direction ? "plus" : "less") + " " + currencyFilter(vm.transaction.commission) + " commission)" : "";

				vm.transaction.memo = quantity + price + commission;
			}
		}

		// Switches from Enter Transaction mode to Edit Schedule mode
		function edit() {
			vm.mode = "Edit Schedule";
			vm.transaction = vm.schedule;
		}

		// Enter a transaction based on the schedule, update the next due date and close the modal
		function enter() {
			vm.errorMessage = null;
			transactionModel.save(vm.transaction).then(function() {
				// Skip to the next due date
				vm.skip();
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Skip the next scheduled occurrence, update the next due date and close the modal
		function skip() {
			// Calculate the next due date for the schedule
			vm.calculateNextDue();

			// Update the schedule
			vm.save(true);
		}

		// Save and close the modal
		function save(skipped) {
			vm.errorMessage = null;

			// Ensure the flag is appropriately set or cleared
			if (vm.schedule.autoFlag) {
				vm.schedule.flag = vm.schedule.flag || "(no memo)";
			} else {
				vm.schedule.flag = null;
			}

			scheduleModel.save(vm.schedule).then(function(schedule) {
				// Close the modal
				$modalInstance.close({data: schedule, skipped: !!skipped});
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without saving
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
