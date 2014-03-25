(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction Index controller
	mod.controller('transactionIndexController', ['$scope', '$modal', 'transactionModel', 'currencyFilter', 'account',
		function($scope, $modal, transactionModel, currencyFilter, account) {
			// Store the account we're working with in the scope
			$scope.account = account;

			var editTransaction = function(index) {
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
					var fromDate = new Date(transaction.transaction_date);
					if (transaction.transaction_date <= $scope.firstTransactionDate) {
						// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
						$scope.getTransactions('next', fromDate.setDate(fromDate.getDate() - 1));
					} else if (transaction.transaction_date >= $scope.lastTransactionDate && !$scope.atEnd) {
						// Transaction date is later than the latest fetched transaction, refresh from the new date
						$scope.getTransactions('prev', fromDate.setDate(fromDate.getDate() + 1));
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
					}

					// Enable navigation on the table
					$scope.navigationDisabled = false;
				}, function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deleteTransaction = function(index) {
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

					// Enable navigation on the table
					$scope.navigationDisabled = false;
				}, function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
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
				deleteAction: deleteTransaction
			};

			// The current set of transactions
			$scope.transactions = [];

			// Flags to show loading indicators when going backwards or forwards
			$scope.loading = {
				prev: false,
				next: false
			};

			// Fetch a batch of transactions
			$scope.getTransactions = function(direction, fromDate) {
				// Show the loading spinner
				$scope.loading[direction] = true;

				if (!fromDate) {
					var fromIndex = ('prev' === direction ? 0 : $scope.transactions.length - 1);

					// Get the from date (depending on which direction we're fetching)
					if ($scope.transactions[fromIndex]) {
						fromDate = $scope.transactions[fromIndex].transaction_date;
					}
				}

				transactionModel.findByAccount($scope.account.id, fromDate, direction).then(function(transactionBatch) {
					if (transactionBatch.transactions.length > 0) {
						// Store the opening balance & transactions
						$scope.openingBalance = transactionBatch.openingBalance;
						$scope.transactions = transactionBatch.transactions;
						$scope.atEnd = transactionBatch.atEnd && ('next' === direction || !fromDate);

						// Get the boundaries of the current transaction date range
						$scope.firstTransactionDate = transactionBatch.transactions[0].transaction_date;
						$scope.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length -1].transaction_date;

						// Update the running balances
						updateRunningBalances();
					}

					// TODO Store the current scroll distance to the bottom
					//var distanceToEnd = $window.height() - $window.scrollTop();   // or whatever this is…

					// TODO Scroll back to the same distance to the bottom
					//$window.scrollTo($window.height() - distanceToEnd); 

					// Hide spinner
					$scope.loading[direction] = false;
				});
			};

			// TODO Scroll to the bottom
			//$timeout($window.scrollTo($window.height())));

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

			// Get the initial batch of transactions to display
			$scope.getTransactions('prev');
		}
	]);
})();
