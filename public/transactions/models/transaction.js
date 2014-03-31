(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction model
	mod.factory('transactionModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves a batch of transactions for an account
			model.findByAccount = function(id, fromDate, direction) {
				return $http.get('/accounts/' + id + '/transactions', {
					params: {
						as_at: fromDate,
						direction: direction
					}
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves subtransactions for a given split transaction
			model.findSubtransactions = function(accountId, transactionId) {
				return $http.get('/accounts/' + accountId + '/transactions/' + transactionId + '/subtransactions').then(function(response) {
					return response.data;
				});
			};

			// Saves a transaction
			model.save = function(accountId, transaction) {
				return $http({
					method: transaction.id ? 'PATCH' : 'POST',
					url: '/accounts/' + accountId + '/transactions' + (transaction.id ? '/' + transaction.id : ''),
					data: transaction
				});
			};

			// Deletes a transaction
			model.destroy = function(accountId, transaction) {
				return $http.delete('/accounts/' + accountId + '/transactions/' + transaction.id);
			};

			return model;
		}
	]);
})();
