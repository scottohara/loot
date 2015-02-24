(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "$timeout", "$window", "$state", "transactionModel", "accountModel", "ogTableNavigableService", "ogViewScrollService", "contextModel", "context", "transactionBatch"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, $timeout, $window, $state, transactionModel, accountModel, ogTableNavigableService, ogViewScrollService, contextModel, context, transactionBatch) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.context = context;
		vm.contextType = contextModel && contextModel.type();
		vm.transactions = [];
		vm.firstTransactionDate = null;
		vm.lastTransactionDate = null;
		vm.atEnd = true;
		vm.openingBalance = 0;
		vm.closingBalance = 0;
		vm.reconcileTarget = 0;
		vm.clearedTotal = 0;
		vm.unclearedTotal = 0;
		vm.reconcilable = "account" === vm.contextType;
		vm.reconciling = false;
		vm.unreconciledOnly = vm.reconcilable && accountModel.isUnreconciledOnly(vm.context.id);
		vm.loading = {prev: false, next: false};
		vm.today = moment().startOf("day").toDate();
		vm.editTransaction = editTransaction;
		vm.contextChanged = contextChanged;
		vm.deleteTransaction = deleteTransaction;
		vm.removeTransaction = removeTransaction;
		vm.updateClosingBalance = updateClosingBalance;
		vm.isAllowed = isAllowed;
		vm.promptToSwitchAccounts = promptToSwitchAccounts;
		vm.tableActions = tableActions();
		vm.getTransactions = getTransactions;
		vm.processTransactions = processTransactions;
		vm.updateRunningBalances = updateRunningBalances;
		vm.focusTransaction = focusTransaction;
		vm.toggleUnreconciledOnly = vm.reconcilable ? toggleUnreconciledOnly : undefined;
		vm.save = vm.reconcilable ? save : undefined;
		vm.cancel = vm.reconcilable ? cancel : undefined;
		vm.reconcile = vm.reconcilable ? reconcile : undefined;
		vm.updateReconciledTotals = vm.reconcilable ? updateReconciledTotals : undefined;
		vm.toggleCleared = vm.reconcilable ? toggleCleared : undefined;
		vm.toggleSubtransactions = toggleSubtransactions;
		vm.flag = flag;
		vm.switchTo = switchTo;
		vm.switchToAccount = switchToAccount;
		vm.switchAccount = switchAccount;
		vm.switchPrimaryAccount = switchPrimaryAccount;
		vm.switchPayee = switchPayee;
		vm.switchSecurity = switchSecurity;
		vm.switchCategory = switchCategory;
		vm.switchSubcategory = switchSubcategory;
		vm.stateChangeSuccessHandler = stateChangeSuccessHandler;

		/**
		 * Implementation
		 */
		function editTransaction(index) {
			// Abort if the transaction can't be edited
			if (!isNaN(index) && !vm.isAllowed("edit", vm.transactions[index])) {
				return;
			}

			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "transactions/views/edit.html",
				controller: "TransactionEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "lg",
				resolve: {
					transaction: function() {
						// If we didn't get an index, we're adding a new transaction
						if (isNaN(index)) {
							return {
								transaction_type: "Basic",
								transaction_date: moment().startOf("day").toDate(),
								primary_account: "account" === vm.contextType ? vm.context : undefined,
								payee: "payee" === vm.contextType ? vm.context : undefined,
								security: "security" === vm.contextType ? vm.context : undefined,
								category: "category" === vm.contextType ? (vm.context.parent ? vm.context.parent : vm.context) : undefined,
								subcategory: "category" === vm.contextType && vm.context.parent ? vm.context : undefined
							};
						}

						// If the selected transaction is a Split/Loan Repayment/Payslip; fetch the subtransactions first
						switch (vm.transactions[index].transaction_type) {
							case "Split":
							case "LoanRepayment":
							case "Payslip":
								vm.transactions[index].subtransactions = [];
								return transactionModel.findSubtransactions(vm.transactions[index].id).then(function(subtransactions) {
									vm.transactions[index].subtransactions = subtransactions;
									return vm.transactions[index];
								});
							default:
								return vm.transactions[index];
						}
					}
				}
			}).result.then(function(transaction) {
				// If the context has changed, remove the transaction from the array
				if (vm.contextChanged(transaction)) {
					vm.removeTransaction(index);
				} else {
					// Update the closing balance
					vm.updateClosingBalance(vm.transactions[index], transaction);

					var	fromDate = moment(transaction.transaction_date);

					if (!fromDate.isAfter(vm.firstTransactionDate)) {
						// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
						vm.getTransactions("next", fromDate.subtract(1, "days").toDate(), transaction.id);
					} else if (!fromDate.isBefore(vm.lastTransactionDate) && !vm.atEnd) {
						// Transaction date is later than the latest fetched transaction, refresh from the new date
						vm.getTransactions("prev", fromDate.add(1, "days").toDate(), transaction.id);
					} else {
						// Transaction date is within the boundaries of the fetched range (or we've fetched to the end)
						if (isNaN(index)) {
							// Add new transaction to the end of the array
							vm.transactions.push(transaction);

						} else {
							// Update the existing transaction in the array
							vm.transactions[index] = transaction;
						}

						// Resort the array
						vm.transactions.sort(byTransactionDateAndId);

						// Recalculate the running balances
						vm.updateRunningBalances();

						// Refocus the transaction
						vm.focusTransaction(transaction.id);
					}
				}
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		function contextChanged(transaction) {
			var	currentContext;

			// Check if the transaction still matches the context
			switch (vm.contextType) {
				case "account":
					currentContext = transaction.primary_account;
					break;

				case "payee":
					currentContext = transaction.payee;
					break;

				case "security":
					currentContext = transaction.security;
					break;

				case "category":
					currentContext = vm.context.parent ? transaction.subcategory : transaction.category;
					break;

				default:
					// Search mode - check if the transaction memo still matches the search query
					return transaction.memo.toLowerCase().indexOf(vm.context.toLowerCase()) === -1;
			}

			return currentContext.id !== vm.context.id;
		}

		function deleteTransaction(index) {
			// Abort if the transaction can't be deleted
			if (!vm.isAllowed("delete", vm.transactions[index])) {
				return;
			}

			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "transactions/views/delete.html",
				controller: "TransactionDeleteController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					transaction: function() {
						return vm.transactions[index];
					}
				}
			}).result.then(function() {
				// Remove the transaction from the list
				vm.removeTransaction(index);
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		// Removes a transaction from the list
		function removeTransaction(index) {
			// Update the context's closing balance
			vm.updateClosingBalance(vm.transactions[index]);

			// Splice the transaction from the array
			vm.transactions.splice(index, 1);

			// If the transaction was focused, transition to the parent state
			if ($state.includes("**.transaction")) {
				$state.go("^");
			}
		}

		// Updates the context's closing balance after adding, editing or deleting a transaction
		function updateClosingBalance(originalTransaction, newTransaction) {
			// Only proceed if the context has a closing balance (ie. not in search mode)
			if (vm.context.hasOwnProperty("closing_balance")) {
				// If there was an original transaction, exclude it's amount from the closing balance
				if (originalTransaction) {
					vm.context.closing_balance = Number(vm.context.closing_balance) - (Number(originalTransaction.amount) * ("inflow" === originalTransaction.direction ? 1 : -1));
				}

				// If there is a new transaction, include it's amount in the closing balance
				if (newTransaction) {
					vm.context.closing_balance = Number(vm.context.closing_balance) + (Number(newTransaction.amount) * ("inflow" === newTransaction.direction ? 1 : -1));
				}
			}
		}

		// Returns true if the action is allowed for the transaction
		function isAllowed(action, transaction) {
			var	allowed = true,
					message;

			// Check if the action is allowed
			switch (transaction.transaction_type) {
				case "Sub":
				case "Subtransfer":
					allowed = false;
					message = "This transaction is part of a split transaction. You can only " + action + " it from the parent account. Would you like to switch to the parent account now?";
					break;

				case "Dividend":
				case "SecurityInvestment":
					if ("investment" !== transaction.primary_account.account_type && "edit" === action) {
						allowed = false;
						message = "This is an investment transaction. You can only " + action + " if from the investment account. Would you like to switch to the investment account now?";
					}
					break;
			}

			// If the action is not allowed, show the confirmation prompt
			if (!allowed) {
				vm.promptToSwitchAccounts(message, transaction);
			}

			return allowed;
		}

		function promptToSwitchAccounts(message, transaction) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "og-components/og-modal-confirm/views/confirm.html",
				controller: "OgModalConfirmController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					confirm: function() {
						return {
							header: "Switch account?",
							message: message
						};
					}
				}
			}).result.then(function() {
				// Switch to the other account
				if (transaction.account && transaction.account.id) {
					vm.switchAccount(null, transaction);
				} else {
					vm.switchPrimaryAccount(null, transaction);
				}
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		// Action handlers for navigable table
		function tableActions() {
			return {
				selectAction: function(index) {
					if (!vm.reconciling) {
						// When not reconciling, select action is to edit the transaction
						vm.editTransaction(index);
					} else {
						// When reconciling, select action is to toggle the cleared status
						var transaction = vm.transactions[index];
						transaction.status = ("Cleared" === transaction.status ? "" : "Cleared");
						vm.toggleCleared(transaction);
					}
				},
				editAction: vm.editTransaction,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					vm.editTransaction();
				},
				deleteAction: vm.deleteTransaction,
				focusAction: function(index) {
					$state.go(($state.includes("**.transaction") ? "^" : "") + ".transaction", {
						transactionId: vm.transactions[index].id
					});
				}
			};
		}

		// Fetch a batch of transactions
		function getTransactions(direction, fromDate, transactionIdToFocus) {
			var transactionFetch;

			// Show the loading spinner
			vm.loading[direction] = true;

			if (!fromDate) {
				var fromIndex = ("prev" === direction ? 0 : vm.transactions.length - 1);

				// Get the from date (depending on which direction we're fetching)
				if (vm.transactions[fromIndex]) {
					fromDate = vm.transactions[fromIndex].transaction_date;
				}
			}

			if (vm.contextType) {
				// Get all transactions for the context
				transactionFetch = transactionModel.all(contextModel.path(vm.context.id), fromDate, direction, vm.unreconciledOnly);
			} else {
				// Search for transactions matching the query
				transactionFetch = transactionModel.query(vm.context, fromDate, direction);
			}

			transactionFetch.then(function(transactionBatch) {
				// Process the transaction batch
				vm.processTransactions(transactionBatch, fromDate, transactionIdToFocus);

				// Hide spinner
				vm.loading[direction] = false;
			});
		}

		// Processes a batch of transactions
		function processTransactions(transactionBatch, fromDate, transactionIdToFocus) {
			if (transactionBatch.transactions.length > 0) {
				// Store the opening balance & transactions
				vm.openingBalance = transactionBatch.openingBalance;
				vm.transactions = transactionBatch.transactions;
				vm.atEnd = transactionBatch.atEnd || (undefined === fromDate);

				// Get the boundaries of the current transaction date range
				vm.firstTransactionDate = transactionBatch.transactions[0].transaction_date;
				vm.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length -1].transaction_date;

				// Update the running balances
				vm.updateRunningBalances();

				// Focus on the specified transaction (if provided)
				if (!isNaN(transactionIdToFocus)) {
					vm.focusTransaction(transactionIdToFocus);
				}

				// Update the reconciled amounts if in reconcile mode
				if (vm.reconciling) {
					vm.updateReconciledTotals();
				}
			}
		}

		// Updates the running balance of all transactions
		function updateRunningBalances() {
			// Do nothing for investment accounts
			if ("investment" === vm.context.account_type) {
				return;
			}

			vm.transactions.reduce(function(openingBalance, transaction) {
				transaction.balance = openingBalance + (transaction.amount * ("inflow" === transaction.direction ? 1 : -1));
				return transaction.balance;
			}, vm.openingBalance);
		}

		// Finds a specific transaction and focusses that row in the table
		function focusTransaction(transactionIdToFocus) {
			var targetIndex;

			// Find the transaction by it's id
			angular.forEach(vm.transactions, function(transaction, index) {
				if (isNaN(targetIndex) && transaction.id === transactionIdToFocus) {
					targetIndex = index;
				}
			});

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				$timeout(function() {
					vm.tableActions.focusRow(targetIndex);
				}, 50);
			}

			return targetIndex;
		}

		// Helper function to sort by transaction date, then by transaction id
		function byTransactionDateAndId(a, b) {
			var x, y;

			if (moment(a.transaction_date).isSame(b.transaction_date)) {
				x = a.id;
				y = b.id;
			} else {
				x = a.transaction_date;
				y = b.transaction_date;
			}

			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		// Toggles the unreconciled only flag
		function toggleUnreconciledOnly(unreconciledOnly, direction, fromDate, transactionIdToFocus) {
			// Store the setting for the current account
			accountModel.unreconciledOnly(vm.context.id, unreconciledOnly);
			vm.unreconciledOnly = unreconciledOnly;
			vm.transactions = [];
			vm.getTransactions(direction || "prev", fromDate, transactionIdToFocus);
		}

		// Updates all cleared transactions to reconciled
		function save() {
			accountModel.reconcile(vm.context.id).then(function() {
				// Remove the closing balance from local storage
				$window.localStorage.removeItem("lootClosingBalance-" + vm.context.id);

				// Exit reconcile mode
				vm.reconciling = false;

				// Refresh the transaction list
				vm.transactions = [];
				vm.getTransactions("prev");
			});
		}

		// Cancels the reconciliation process
		function cancel() {
			vm.reconciling = false;
		}

		// Launches the account reconciliation process
		function reconcile() {
			// Show the modal
			$modal.open({
				templateUrl: "accounts/views/reconcile.html",
				controller: "AccountReconcileController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm",
				resolve: {
					account: function() {
						return vm.context;
					}
				}
			}).result.then(function(closingBalance) {
				// Make the closing balance available on the scope
				vm.closingBalance = closingBalance;

				// Switch to reconcile mode
				vm.reconciling = true;

				// Refresh the list with only unreconciled transactions
				vm.toggleUnreconciledOnly(true);
			});
		}

		// Helper function to calculate the total cleared/uncleared totals
		function updateReconciledTotals() {
			// Target is the closing balance, minus the opening balance
			vm.reconcileTarget = Number((vm.closingBalance - vm.openingBalance).toFixed(2));

			// Cleared total is the sum of all transaction amounts that are cleared
			vm.clearedTotal = vm.transactions.reduce(function(clearedAmount, transaction) {
				if ("Cleared" === transaction.status) {
					clearedAmount += (transaction.amount * ("inflow" === transaction.direction ? 1 : -1));
				}

				return Number(clearedAmount.toFixed(2));
			}, 0);

			// Uncleared total is the target less the cleared total
			vm.unclearedTotal = Number((vm.reconcileTarget - vm.clearedTotal).toFixed(2));
		}

		// Toggles a transaction as cleared
		function toggleCleared(transaction) {
			transactionModel.updateStatus(contextModel.path(vm.context.id), transaction.id, transaction.status).then(function() {
				// Update reconciled totals
				vm.updateReconciledTotals();
			});
		}

		// Shows/hides subtransactions
		function toggleSubtransactions($event, transaction) {
			// Toggle the show flag
			transaction.showSubtransactions = !transaction.showSubtransactions;

			// If we’re showing
			if (transaction.showSubtransactions) {
				// Show the loading indicator
				transaction.loadingSubtransactions = true;

				// Clear the array
				transaction.subtransactions = [];

				// Resolve the subtransactions
				transactionModel.findSubtransactions(transaction.id).then(function(subtransactions) {
					transaction.subtransactions = subtransactions;

					// Hide the loading indicator
					transaction.loadingSubtransactions = false;
				});
			}

			$event.cancelBubble = true;
		}

		// Opens the flag transaction dialog
		function flag(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "transactions/views/flag.html",
				controller: "TransactionFlagController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm",
				resolve: {
					transaction: function() {
						return vm.transactions[index];
					}
				}
			}).result.then(function(transaction) {
				// Update the existing transaction in the array
				vm.transactions[index] = transaction;
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		// Helper function for switching states
		function switchTo($event, state, id, transaction) {
			// For Subtransactions, don't switch to the parent
			// (only applies when switching between Category <=> Subcategory transaction lists)
			if ("Sub" === transaction.transaction_type) {
				transaction.parent_id = null;
			}
			
			$state.go("root." + state + ".transactions.transaction", {
				id: id,
				transactionId: transaction.parent_id || transaction.id
			});

			if ($event) {
				$event.stopPropagation();
			}
		}

		function switchToAccount($event, id, transaction) {
			// If the transaction is reconciled, make sure the account we're switching to shows reconciled transactions
			if ("Reconciled" === transaction.status) {
				accountModel.unreconciledOnly(id, false);
			}

			vm.switchTo($event, "accounts.account", id, transaction);
		}

		// Switch to the other side of a transaction
		function switchAccount($event, transaction) {
			vm.switchToAccount($event, transaction.account.id, transaction);
		}

		// Switch to the primary account of a transaction
		function switchPrimaryAccount($event, transaction) {
			vm.switchToAccount($event, transaction.primary_account.id, transaction);
		}

		// Switch to the transaction's payee
		function switchPayee($event, transaction) {
			vm.switchTo($event, "payees.payee", transaction.payee.id, transaction);
		}

		// Switch to the transaction's security
		function switchSecurity($event, transaction) {
			vm.switchTo($event, "securities.security", transaction.security.id, transaction);
		}

		// Switch to the transaction's category
		function switchCategory($event, transaction) {
			vm.switchTo($event, "categories.category", transaction.category.id, transaction);
		}

		// Switch to the transaction's subcategory
		function switchSubcategory($event, transaction) {
			vm.switchTo($event, "categories.category", transaction.subcategory.id, transaction);
		}

		// Process the initial batch of transactions to display
		vm.processTransactions(transactionBatch, undefined, Number($state.params.transactionId));

		// Listen for state change events, and when the transactionId or id parameters change, ensure the row is focussed
		function stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.transactionId && (toParams.transactionId !== fromParams.transactionId || toParams.id !== fromParams.id)) {
				if (isNaN(vm.focusTransaction(Number(toParams.transactionId)))) {
					// Transaction was not found in the current set
					
					// Get the transaction details from the server
					transactionModel.find(toParams.transactionId).then(function(transaction) {
						var	fromDate = moment(transaction.transaction_date),
								direction;

						if (!fromDate.isAfter(vm.firstTransactionDate)) {
							// Transaction date is earlier than the earliest fetched transaction
							fromDate = fromDate.subtract(1, "day");
							direction = "next";
						} else if (!fromDate.isBefore(vm.lastTransactionDate) && !vm.atEnd) {
							// Transaction date is later than the latest fetched transaction
							fromDate = fromDate.add(1, "day");
							direction = "prev";
						}

						fromDate = fromDate.toDate();

						if (vm.unreconciledOnly) {
							// If we're not already showing reconciled transactions, toggle the setting
							vm.toggleUnreconciledOnly(false, direction, fromDate, Number(toParams.transactionId));
						} else {
							// Otherwise just get refresh the transactions from the new date
							vm.getTransactions(direction, fromDate, Number(toParams.transactionId));
						}
					});
				}
			}
		}

		// Handler is wrapped in a function to aid with unit testing
		$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			vm.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
		});

		// Auto scroll to the bottom
		ogViewScrollService.scrollTo("bottom");
	}
})();
