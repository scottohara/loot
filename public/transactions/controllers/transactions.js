(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transactions controller
	mod.controller('transactionsController', ['$scope', '$http', '$stateParams', 'filterFilter', 'limitToFilter', 'payeeModel', 'categoryModel', 'accountModel', 'transactionModel',
		function($scope, $http, $stateParams, filterFilter, limitToFilter, payeeModel, categoryModel, accountModel, transactionModel) {
			// List of payees for the typeahead
			$scope.payees = function(filter, limit) {
				return payeeModel.all().then(function(payees) {
					return limitToFilter(filterFilter(payees, filter), limit);
				});
			};

			// List of categories for the typeahead
			$scope.categories = function(filter, limit, parent) {
				return categoryModel.all(parent).then(function(categories) {
					// For the category dropdown, include psuedo-categories that change the transaction type
					if (!parent) {
						categories = [
							{ id: "Transfer", name: "Transfer" },
							{ id: "Split", name: "Split" },
							{ id: "Payslip", name: "Payslip" },
							{ id: "LoanRepayment", name: "Loan Repayment" }
						].concat(categories);
					}

					return limitToFilter(filterFilter(categories, filter), limit);
				});
			};

			// When the category changes, check if the transaction type needs to change
			$scope.categorySelected = function(category, index) {
				// Default to Basic
				var type = 'Basic';

				// Check the category selection
				switch (category.id) {
					case "Transfer":
					case "Split":
					case "Payslip":
					case "LoanRepayment":
						type = category.id;
						break;
				}

				// Set the transaction type
				$scope.transactions[index].transaction_type = type;
			};

			// List of accounts for the typeahead
			$scope.accounts = function(filter, limit) {
				return accountModel.all().then(function(accounts) {
					return limitToFilter(filterFilter(accounts, filter), limit);
				});
			};

			// Saves a transaction
			$scope.saveChanges = function(index) {
				console.log("data for row " + index, $scope.transactions[index]);
				return true;
			};

			// The maximum number of transactions before we start paging out
			var MAX_TRANSACTIONS = 200;

			// The current set of transactions
			$scope.transactions = [];

			// Flags to show loading indicators when going backwards or forwards
			$scope.loading = {
				prev: false,
				next: false
			};

			// Fetch a batch of transactions
			$scope.getTransactions = function(direction) {
				// Show the loading spinner
				$scope.loading[direction] = true;

				var fromIndex = ('prev' === direction ? 0 : $scope.transactions.length - 1),
						fromDate;

				// Get the from date (depending on which direction we're fetching)
				if ($scope.transactions[fromIndex]) {
					fromDate = $scope.transactions[fromIndex].transaction_date;
				}

				transactionModel.findByAccount($stateParams.accountId, fromDate, direction).then(function(transactionBatch) {
					// Calculate the running balances of the new batch of transactions
					transactionBatch.transactions = calculateRunningBalances(transactionBatch.transactions, transactionBatch.openingBalance);
					
					// Prepend/append the batch of transactions to the existing set
					if ('prev' === direction) {
						$scope.transactions = transactionBatch.transactions.concat($scope.transactions).slice(0, MAX_TRANSACTIONS);
					} else {
						$scope.transactions = $scope.transactions.concat(transactionBatch.transactions).slice(MAX_TRANSACTIONS * -1);
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

			// Updates the running balance of all transactions from the specified index
			var calculateRunningBalances = function(transactions, openingBalance) {
				transactions.reduce(function(openingBalance, transaction) {
					transaction['balance'] = openingBalance + (transaction.amount * ('inflow' === transaction.direction ? 1 : -1));
					return transaction['balance'];
				}, openingBalance);

				return transactions;
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
					transactionModel.findSubtransactions($stateParams.accountId, transaction.id).then(function(subtransactions) {
						transaction.subtransactions = subtransactions;

						// Hide the loading indicator
						transaction.loadingSubtransactions = false;
					});
				};

				$event.cancelBubble = true;
			};

			// Get the initial batch of transactions to display
			$scope.getTransactions('prev');
		}
	]);

})();
