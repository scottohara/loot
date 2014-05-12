(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction Index controller
	mod.controller('transactionIndexController', ['$scope', '$modal', '$timeout', '$window', '$state', 'currencyFilter', 'transactionModel', 'accountModel', 'account', 'transactionBatch',
		function($scope, $modal, $timeout, $window, $state, currencyFilter, transactionModel, accountModel, account, transactionBatch) {
			// Store the account we're working with in the scope
			$scope.account = account;

			var editTransaction = function(index) {
				// Abort if the transaction is readonly
				if (!isNaN(index) && isReadOnly(index)) {
					return;
				}

				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'transactions/views/edit.html',
					controller: 'transactionEditController',
					backdrop: 'static',
					resolve: {
						account: function() {
							return $scope.account;
						},
						transaction: function() {
							// If we didn't get an index, we're adding a new transaction so just return null
							if (isNaN(index)) {
								return null;
							}

							// If the selected transaction is a Split/Loan Repayment/Payslip; fetch the subtransactions first
							switch ($scope.transactions[index].transaction_type) {
								case "Split":
								case "LoanRepayment":
								case "Payslip":
									$scope.transactions[index].subtransactions = [];
									return transactionModel.findSubtransactions($scope.account.id, $scope.transactions[index].id).then(function(subtransactions) {
										$scope.transactions[index].subtransactions = subtransactions;
										return $scope.transactions[index];
									});
								default:
									return $scope.transactions[index];
							}
						}
					}
				}).result.then(function(transaction) {
					var	fromDate = moment(transaction.transaction_date);

					if (!fromDate.isAfter($scope.firstTransactionDate)) {
						// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
						$scope.getTransactions('next', fromDate.subtract('days', 1).toISOString(), transaction.id);
					} else if (!fromDate.isBefore($scope.lastTransactionDate) && !$scope.atEnd) {
						// Transaction date is later than the latest fetched transaction, refresh from the new date
						$scope.getTransactions('prev', fromDate.add('days', 1).toISOString(), transaction.id);
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
						updateRunningBalances();

						// Refocus the transaction
						focusTransaction(transaction.id);
					}
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deleteTransaction = function(index) {
				// Abort if the transaction is readonly
				if (isReadOnly(index)) {
					return;
				}

				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'transactions/views/delete.html',
					controller: 'transactionDeleteController',
					backdrop: 'static',
					resolve: {
						account: function() {
							return $scope.account;
						},
						transaction: function() {
							return $scope.transactions[index];
						}
					}
				}).result.then(function() {
					$scope.transactions.splice(index, 1);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Returns true if the transaction should not be editable/deletable
			var isReadOnly = function(index) {
				switch ($scope.transactions[index].transaction_type) {
					case "Subtransfer":
						return true;

					case "Dividend":
					case "SecurityInvestment":
						return "investment" !== $scope.account.account_type;

					default:
						return false;
				}
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !$scope.navigationDisabled;
				},
				selectAction: editTransaction,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					editTransaction();
				},
				deleteAction: deleteTransaction,
				focusAction: function(index) {
					$state.go('root.accounts.account.transactions.transaction', {
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
				// Show the loading spinner
				$scope.loading[direction] = true;

				if (!fromDate) {
					var fromIndex = ('prev' === direction ? 0 : $scope.transactions.length - 1);

					// Get the from date (depending on which direction we're fetching)
					if ($scope.transactions[fromIndex]) {
						fromDate = $scope.transactions[fromIndex].transaction_date;
					}
				}

				transactionModel.findByAccount($scope.account.id, fromDate, direction, $scope.unreconciledOnly).then(function(transactionBatch) {
					// Process the transaction batch
					processTransactions(transactionBatch, fromDate, transactionIdToFocus);

					// Hide spinner
					$scope.loading[direction] = false;
				});
			};

			// Processes a batch of transactions
			var processTransactions = function(transactionBatch, fromDate, transactionIdToFocus) {
				if (transactionBatch.transactions.length > 0) {
					// Store the opening balance & transactions
					$scope.openingBalance = transactionBatch.openingBalance;
					$scope.transactions = transactionBatch.transactions;
					$scope.atEnd = transactionBatch.atEnd || (undefined === fromDate);

					// Get the boundaries of the current transaction date range
					$scope.firstTransactionDate = transactionBatch.transactions[0].transaction_date;
					$scope.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length -1].transaction_date;

					// Update the running balances
					updateRunningBalances();

					// Focus on the specified transaction (if provided)
					if (!isNaN(transactionIdToFocus)) {
						focusTransaction(transactionIdToFocus);
					}

					// Update the reconciled amounts if in reconcile mode
					if ($scope.reconciling) {
						updateReconciledTotals();
					}
				}
			};

			// Updates the running balance of all transactions
			var updateRunningBalances = function() {
				// Do nothing for investment accounts
				if ('investment' === $scope.account.account_type) {
					return;
				}

				$scope.transactions.reduce(function(openingBalance, transaction) {
					transaction['balance'] = openingBalance + (transaction.amount * ('inflow' === transaction.direction ? 1 : -1));
					return transaction['balance'];
				}, $scope.openingBalance);
			};

			// Finds a specific transaction and focusses that row in the table
			var focusTransaction = function(transactionIdToFocus) {
				var targetIndex;

				// Find the transaction by it's id
				angular.forEach($scope.transactions, function(transaction, index) {
					if (transaction.id === transactionIdToFocus) {
						targetIndex = index;
					}
				});

				// Focus the row
				$timeout(function() {
					$scope.tableActions.focusRow(targetIndex);
				}, 50);

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

			// Get the unreconciled only setting for the current account
			$scope.unreconciledOnly = accountModel.isUnreconciledOnly($scope.account.id);

			// Toggles the unreconciled only flag
			$scope.toggleUnreconciledOnly = function(unreconciledOnly, fromDate, transactionIdToFocus) {
				// Store the setting for the current account
				accountModel.unreconciledOnly($scope.account.id, unreconciledOnly);
				$scope.unreconciledOnly = unreconciledOnly;
				$scope.transactions = [];
				$scope.getTransactions('prev', fromDate, transactionIdToFocus);
			};

			// Shows/hides subtransactions
			$scope.toggleSubtransactions = function($event, transaction) {
				// Toggle the show flag
				transaction.showSubtransactions = !transaction.showSubtransactions;

				// If we’re showing
				if (transaction.showSubtransactions) {
					// Show the loading indicator
					transaction.loadingSubtransactions = true;

					// Clear the array?
					transaction.subtransactions = [];

					// Resolve the subtransactions
					transactionModel.findSubtransactions($scope.account.id, transaction.id).then(function(subtransactions) {
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
					templateUrl: 'transactions/views/flag.html',
					controller: 'transactionFlagController',
					backdrop: 'static',
					resolve: {
						account: function() {
							return $scope.account;
						},
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

			// Launches the account reconciliation process
			$scope.reconcile = function() {
				// Show the modal
				$modal.open({
					templateUrl: 'transactions/views/reconcile.html',
					controller: 'transactionReconcileController',
					backdrop: 'static',
					resolve: {
						account: function() {
							return $scope.account;
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
			var updateReconciledTotals = function() {
				// Target is the closing balance, minus the opening balance
				$scope.reconcileTarget = Number(($scope.closingBalance - $scope.openingBalance).toFixed(2));

				// Cleared total is the sum of all transaction amounts that are pending
				$scope.clearedTotal = $scope.transactions.reduce(function(clearedAmount, transaction) {
					if ('pending' === transaction.status) {
						clearedAmount += (transaction.amount * ('inflow' === transaction.direction ? 1 : -1));
					}

					return Number(clearedAmount.toFixed(2));
				}, 0);

				// Uncleared total is the target less the cleared total
				$scope.unclearedTotal = Number(($scope.reconcileTarget - $scope.clearedTotal).toFixed(2));
			};

			// Toggles a transaction as pending
			$scope.togglePending = function(transaction) {
				transactionModel.updateStatus($scope.account.id, transaction.id, transaction.status).then(function() {
					// Update reconciled totals
					updateReconciledTotals();
				});
			};

			// Updates all pending transactions to cleared
			$scope.save = function() {
				accountModel.reconcile($scope.account.id).then(function() {
					// Remove the closing balance from local storage
					$window.localStorage.removeItem('lootClosingBalance-' + $scope.account.id);

					$scope.reconciling = false;
				});
			};

			// Cancels the reconciliation process
			$scope.cancel = function() {
				$scope.reconciling = false;
			};

			// Switch to the other side of a transaction
			$scope.switchAccount = function(transaction) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// If the transaction is reconciled, make sure the account we're switching to shows reconciled transactions
				if ('cleared' === transaction.status) {
					accountModel.unreconciledOnly(transaction.account.id, false);
				}

				$state.go('root.accounts.account.transactions.transaction', {
					accountId: transaction.account.id, 
					transactionId: transaction.parent_id || transaction.id
				});
			};

			// Process the initial batch of transactions to display
			processTransactions(transactionBatch);

			// Listen for state change events, and when the transactionId or accountId parameters change, ensure the row is focussed
			$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
				if (toParams.transactionId && (toParams.transactionId !== fromParams.transactionId || toParams.accountId !== fromParams.accountId)) {
					if (!focusTransaction(Number(toParams.transactionId))) {
						// Transaction was not found in the current set
						
						// Get the transaction details from the server
						transactionModel.find(toParams.transactionId).then(function(transaction) {
							var	fromDate = moment(transaction.transaction_date),
									direction;

							if (!fromDate.isAfter($scope.firstTransactionDate)) {
								// Transaction date is earlier than the earliest fetched transaction
								fromDate = fromDate.subtract('days', 1).toISOString();
								direction = 'next';
							} else if (!fromDate.isBefore($scope.lastTransactionDate) && !$scope.atEnd) {
								// Transaction date is later than the latest fetched transaction
								fromDate = fromDate.add('days', 1).toISOString();
								direction = 'prev';
							}

							if ($scope.unreconciledOnly) {
								// If we're not already showing reconciled transactions, toggle the setting
								$scope.toggleUnreconciledOnly(false, fromDate, toParams.transactionId);
							} else {
								// Otherwise just get refresh the transactions from the new date
								$scope.getTransactions(direction, fromDate, toParams.transactionId);
							}
						});
					}
				}
			});

		}
	]);
})();
