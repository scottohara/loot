(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction model
	mod.factory('transactionModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves a single transaction
			model.find = function(accountId, transactionId) {
				return $http.get('/accounts/' + accountId + '/transactions/' + transactionId).then(function(response) {
					return response.data;
				});
			};

			// Retrieves a batch of transactions for an account
			model.findByAccount = function(id, fromDate, direction, unreconciledOnly) {
				return $http.get('/accounts/' + id + '/transactions', {
					params: {
						as_at: fromDate,
						direction: direction,
						unreconciled: unreconciledOnly
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

			// Updates the status of a transaction
			model.updateStatus = function(accountId, transactionId, status) {
				return $http({
					method: status ? 'PATCH' : 'DELETE',
					url: '/accounts/' + accountId + '/transactions/' + transactionId + '/status' + (status ? '?' + status : '')
				});
			};

			// Flags a transaction
			model.flag = function(accountId, transaction) {
				return $http.put('/accounts/' + accountId + '/transactions/' + transaction.id + '/flag', {
					memo: transaction.flag
				});
			};

			// Unflags a transaction
			model.unflag = function(accountId, transactionId) {
				return $http.delete('/accounts/' + accountId + '/transactions/' + transactionId + '/flag');
			};

			return model;
		}
	]);
})();
