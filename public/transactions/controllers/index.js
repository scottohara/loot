(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactions");

	// Declare the Transaction Index controller
	mod.controller("transactionIndexController", ["$scope", "$modal", "$timeout", "$window", "$state", "transactionModel", "accountModel", "contextModel", "context", "transactionBatch",
		function($scope, $modal, $timeout, $window, $state, transactionModel, accountModel, contextModel, context, transactionBatch) {
			// Store the context we're working with in the scope
			$scope.context = context;
			$scope.contextType = contextModel && contextModel.type();

			$scope.editTransaction = function(index) {
				// Abort if the transaction can't be edited
				if (!isNaN(index) && !$scope.isAllowed("edit", $scope.transactions[index])) {
					return;
				}

				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: "transactions/views/edit.html",
					controller: "transactionEditController",
					backdrop: "static",
					size: "lg",
					resolve: {
						transaction: function() {
							// If we didn't get an index, we're adding a new transaction
							if (isNaN(index)) {
								return {
									transaction_type: "Basic",
									transaction_date: moment().format("YYYY-MM-DD"),
									primary_account: "account" === $scope.contextType ? $scope.context : undefined,
									payee: "payee" === $scope.contextType ? $scope.context : undefined,
									security: "security" === $scope.contextType ? $scope.context : undefined,
									category: "category" === $scope.contextType ? ($scope.context.parent ? $scope.context.parent : $scope.context) : undefined,
									subcategory: "category" === $scope.contextType && $scope.context.parent ? $scope.context : undefined,
									subtransactions: [{},{},{},{}]
								};
							}

							// If the selected transaction is a Split/Loan Repayment/Payslip; fetch the subtransactions first
							switch ($scope.transactions[index].transaction_type) {
								case "Split":
								case "LoanRepayment":
								case "Payslip":
									$scope.transactions[index].subtransactions = [];
									return transactionModel.findSubtransactions($scope.transactions[index].id).then(function(subtransactions) {
										$scope.transactions[index].subtransactions = subtransactions;
										return $scope.transactions[index];
									});
								default:
									return $scope.transactions[index];
							}
						}
					}
				}).result.then(function(transaction) {
					// If the context has changed, remove the transaction from the array
					if ($scope.contextChanged(transaction)) {
						$scope.transactions.splice(index, 1);
						if ($state.includes("**.transaction")) {
							$state.go("^");
						}
					} else {
						var	fromDate = moment(transaction.transaction_date);

						if (!fromDate.isAfter($scope.firstTransactionDate)) {
							// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
							$scope.getTransactions("next", fromDate.subtract("days", 1).format("YYYY-MM-DD"), transaction.id);
						} else if (!fromDate.isBefore($scope.lastTransactionDate) && !$scope.atEnd) {
							// Transaction date is later than the latest fetched transaction, refresh from the new date
							$scope.getTransactions("prev", fromDate.add("days", 1).format("YYYY-MM-DD"), transaction.id);
						} else {
							// Transaction date is within the boundaries of the fetched range (or we've fetched to the end)
							if (isNaN(index)) {
								// Add new transaction to the end of the array
								$scope.transactions.push(transaction);
							} else {
								// Update the existing transaction in the array
								$scope.transactions[index] = transaction;
							}

							// Resort the array
							$scope.transactions.sort(byTransactionDateAndId);

							// Recalculate the running balances
							$scope.updateRunningBalances();

							// Refocus the transaction
							$scope.focusTransaction(transaction.id);

							// Refetch the context (to get the updated closing balance)
							contextModel.find($scope.context.id).then(function(context) {
								$scope.context = context;
							});
						}
					}
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			$scope.contextChanged = function(transaction) {
				var	currentContext;

				// Check if the transaction still matches the context
				switch ($scope.contextType) {
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
						currentContext = $scope.context.parent ? transaction.subcategory : transaction.category;
						break;

					default:
						// Search mode - check if the transaction memo still matches the search query
						return transaction.memo.indexOf($scope.context) === -1;
				}

				return currentContext.id !== $scope.context.id;
			};

			$scope.deleteTransaction = function(index) {
				// Abort if the transaction can't be deleted
				if (!$scope.isAllowed("delete", $scope.transactions[index])) {
					return;
				}

				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: "transactions/views/delete.html",
					controller: "transactionDeleteController",
					backdrop: "static",
					resolve: {
						transaction: function() {
							return $scope.transactions[index];
						}
					}
				}).result.then(function() {
					$scope.transactions.splice(index, 1);
					if ($state.includes("**.transaction")) {
						$state.go("^");
					}
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Returns true if the action is allowed for the transaction
			$scope.isAllowed = function(action, transaction) {
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
					$scope.promptToSwitchAccounts(message, transaction);
				}

				return allowed;
			};

			$scope.promptToSwitchAccounts = function(message, transaction) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: "og-components/og-modal-confirm/views/confirm.html",
					controller: "ogModalConfirmController",
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
						$scope.switchAccount(null, transaction);
					} else {
						$scope.switchPrimaryAccount(null, transaction);
					}
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !($scope.navigationDisabled || $scope.navigationGloballyDisabled);
				},
				selectAction: function(index) {
					if (!$scope.reconciling) {
						// When not reconciling, select action is to edit the transaction
						$scope.editTransaction(index);
					} else {
						// When reconciling, select action is to toggle the cleared status
						var transaction = $scope.transactions[index];
						transaction.status = ("Cleared" === transaction.status ? "" : "Cleared");
						$scope.toggleCleared(transaction);
					}
				},
				editAction: $scope.editTransaction,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editTransaction();
				},
				deleteAction: $scope.deleteTransaction,
				focusAction: function(index) {
					$state.go(($state.includes("**.transaction") ? "^" : "") + ".transaction", {
						transactionId: $scope.transactions[index].id
					});
				}
			};

			// The current set of transactions
			$scope.transactions = [];

			// Flags to show loading indicators when going backwards or forwards
			$scope.loading = {
				prev: false,
				next: false
			};

			// Fetch a batch of transactions
			$scope.getTransactions = function(direction, fromDate, transactionIdToFocus) {
				var transactionFetch;

				// Show the loading spinner
				$scope.loading[direction] = true;

				if (!fromDate) {
					var fromIndex = ("prev" === direction ? 0 : $scope.transactions.length - 1);

					// Get the from date (depending on which direction we're fetching)
					if ($scope.transactions[fromIndex]) {
						fromDate = $scope.transactions[fromIndex].transaction_date;
					}
				}

				if ($scope.contextType) {
					// Get all transactions for the context
					transactionFetch = transactionModel.all(contextModel.path($scope.context.id), fromDate, direction, $scope.unreconciledOnly);
				} else {
					// Search for transactions matching the query
					transactionFetch = transactionModel.query($scope.context, fromDate, direction);
				}

				transactionFetch.then(function(transactionBatch) {
					// Process the transaction batch
					$scope.processTransactions(transactionBatch, fromDate, transactionIdToFocus);

					// Hide spinner
					$scope.loading[direction] = false;
				});
			};

			// Processes a batch of transactions
			$scope.processTransactions = function(transactionBatch, fromDate, transactionIdToFocus) {
				if (transactionBatch.transactions.length > 0) {
					// Store the opening balance & transactions
					$scope.openingBalance = transactionBatch.openingBalance;
					$scope.transactions = transactionBatch.transactions;
					$scope.atEnd = transactionBatch.atEnd || (undefined === fromDate);

					// Get the boundaries of the current transaction date range
					$scope.firstTransactionDate = transactionBatch.transactions[0].transaction_date;
					$scope.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length -1].transaction_date;

					// Update the running balances
					$scope.updateRunningBalances();

					// Focus on the specified transaction (if provided)
					if (!isNaN(transactionIdToFocus)) {
						$scope.focusTransaction(transactionIdToFocus);
					}

					// Update the reconciled amounts if in reconcile mode
					if ($scope.reconciling) {
						$scope.updateReconciledTotals();
					}
				}
			};

			// Updates the running balance of all transactions
			$scope.updateRunningBalances = function() {
				// Do nothing for investment accounts
				if ("investment" === $scope.context.account_type) {
					return;
				}

				$scope.transactions.reduce(function(openingBalance, transaction) {
					transaction.balance = openingBalance + (transaction.amount * ("inflow" === transaction.direction ? 1 : -1));
					return transaction.balance;
				}, $scope.openingBalance);
			};

			// Finds a specific transaction and focusses that row in the table
			$scope.focusTransaction = function(transactionIdToFocus) {
				var targetIndex;

				// Find the transaction by it's id
				angular.forEach($scope.transactions, function(transaction, index) {
					if (isNaN(targetIndex) && transaction.id === transactionIdToFocus) {
						targetIndex = index;
					}
				});

				// If found, focus the row
				if (!isNaN(targetIndex)) {
					$timeout(function() {
						$scope.tableActions.focusRow(targetIndex);
					}, 50);
				}

				return targetIndex;
			};

			// Helper function to sort by transaction date, then by transaction id
			var byTransactionDateAndId = function(a, b) {
				var x, y;

				if (a.transaction_date === b.transaction_date) {
					x = a.id;
					y = b.id;
				} else {
					x = a.transaction_date;
					y = b.transaction_date;
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Reconciliation related functions only apply when in an account context
			if ("account" === $scope.contextType) {
				$scope.reconcilable = true;

				// Get the unreconciled only setting for the current account
				$scope.unreconciledOnly = accountModel.isUnreconciledOnly($scope.context.id);

				// Toggles the unreconciled only flag
				$scope.toggleUnreconciledOnly = function(unreconciledOnly, direction, fromDate, transactionIdToFocus) {
					// Store the setting for the current account
					accountModel.unreconciledOnly($scope.context.id, unreconciledOnly);
					$scope.unreconciledOnly = unreconciledOnly;
					$scope.transactions = [];
					$scope.getTransactions(direction || "prev", fromDate, transactionIdToFocus);
				};

				// Updates all cleared transactions to reconciled
				$scope.save = function() {
					accountModel.reconcile($scope.context.id).then(function() {
						// Remove the closing balance from local storage
						$window.localStorage.removeItem("lootClosingBalance-" + $scope.context.id);

						$scope.reconciling = false;
					});
				};

				// Cancels the reconciliation process
				$scope.cancel = function() {
					$scope.reconciling = false;
				};

				// Launches the account reconciliation process
				$scope.reconcile = function() {
					// Show the modal
					$modal.open({
						templateUrl: "transactions/views/reconcile.html",
						controller: "transactionReconcileController",
						backdrop: "static",
						size: "sm",
						resolve: {
							account: function() {
								return $scope.context;
							}
						}
					}).result.then(function(closingBalance) {
						// Make the closing balance available on the scope
						$scope.closingBalance = closingBalance;

						// Switch to reconcile mode
						$scope.reconciling = true;

						// Refresh the list with only unreconciled transactions
						$scope.toggleUnreconciledOnly(true);
					});
				};

				// Helper function to calculate the total cleared/uncleared totals
				$scope.updateReconciledTotals = function() {
					// Target is the closing balance, minus the opening balance
					$scope.reconcileTarget = Number(($scope.closingBalance - $scope.openingBalance).toFixed(2));

					// Cleared total is the sum of all transaction amounts that are cleared
					$scope.clearedTotal = $scope.transactions.reduce(function(clearedAmount, transaction) {
						if ("Cleared" === transaction.status) {
							clearedAmount += (transaction.amount * ("inflow" === transaction.direction ? 1 : -1));
						}

						return Number(clearedAmount.toFixed(2));
					}, 0);

					// Uncleared total is the target less the cleared total
					$scope.unclearedTotal = Number(($scope.reconcileTarget - $scope.clearedTotal).toFixed(2));
				};

				// Toggles a transaction as cleared
				$scope.toggleCleared = function(transaction) {
					transactionModel.updateStatus(contextModel.path($scope.context.id), transaction.id, transaction.status).then(function() {
						// Update reconciled totals
						$scope.updateReconciledTotals();
					});
				};
			}

			// Shows/hides subtransactions
			$scope.toggleSubtransactions = function($event, transaction) {
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
			};

			// Opens the flag transaction dialog
			$scope.flag = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: "transactions/views/flag.html",
					controller: "transactionFlagController",
					backdrop: "static",
					size: "sm",
					resolve: {
						transaction: function() {
							return $scope.transactions[index];
						}
					}
				}).result.then(function(transaction) {
					// Update the existing transaction in the array
					$scope.transactions[index] = transaction;
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Helper function for switching states
			$scope.switchTo = function($event, state, id, transaction) {
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
			};

			$scope.switchToAccount = function($event, id, transaction) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;
				
				// If the transaction is reconciled, make sure the account we're switching to shows reconciled transactions
				if ("Reconciled" === transaction.status) {
					accountModel.unreconciledOnly(id, false);
				}

				$scope.switchTo($event, "accounts.account", id, transaction);
			};

			// Switch to the other side of a transaction
			$scope.switchAccount = function($event, transaction) {
				$scope.switchToAccount($event, transaction.account.id, transaction);
			};

			// Switch to the primary account of a transaction
			$scope.switchPrimaryAccount = function($event, transaction) {
				$scope.switchToAccount($event, transaction.primary_account.id, transaction);
			};

			// Switch to the transaction's payee
			$scope.switchPayee = function($event, transaction) {
				$scope.switchTo($event, "payees.payee", transaction.payee.id, transaction);
			};
	
			// Switch to the transaction's security
			$scope.switchSecurity = function($event, transaction) {
				$scope.switchTo($event, "securities.security", transaction.security.id, transaction);
			};

			// Switch to the transaction's category
			$scope.switchCategory = function($event, transaction) {
				$scope.switchTo($event, "categories.category", transaction.category.id, transaction);
			};

			// Switch to the transaction's subcategory
			$scope.switchSubcategory = function($event, transaction) {
				$scope.switchTo($event, "categories.category", transaction.subcategory.id, transaction);
			};

			// Process the initial batch of transactions to display
			$scope.processTransactions(transactionBatch);

			// Listen for state change events, and when the transactionId or id parameters change, ensure the row is focussed
			$scope.stateChangeSuccessHandler = function(event, toState, toParams, fromState, fromParams) {
				if (toParams.transactionId && (toParams.transactionId !== fromParams.transactionId || toParams.id !== fromParams.id)) {
					if (isNaN($scope.focusTransaction(Number(toParams.transactionId)))) {
						// Transaction was not found in the current set
						
						// Get the transaction details from the server
						transactionModel.find(toParams.transactionId).then(function(transaction) {
							var	fromDate = moment(transaction.transaction_date),
									direction;

							if (!fromDate.isAfter($scope.firstTransactionDate)) {
								// Transaction date is earlier than the earliest fetched transaction
								fromDate = fromDate.subtract("days", 1);
								direction = "next";
							} else if (!fromDate.isBefore($scope.lastTransactionDate) && !$scope.atEnd) {
								// Transaction date is later than the latest fetched transaction
								fromDate = fromDate.add("days", 1);
								direction = "prev";
							}

							fromDate = fromDate.format("YYYY-MM-DD");

							if ($scope.unreconciledOnly) {
								// If we're not already showing reconciled transactions, toggle the setting
								$scope.toggleUnreconciledOnly(false, direction, fromDate, Number(toParams.transactionId));
							} else {
								// Otherwise just get refresh the transactions from the new date
								$scope.getTransactions(direction, fromDate, Number(toParams.transactionId));
							}
						});
					}
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
				$scope.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
			});
		}
	]);
})();
