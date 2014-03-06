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
					headers: {
						accept: 'application/json'
					},
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
				return $http.get('/accounts/' + accountId + '/transactions/' + transactionId + '/subtransactions', {
					headers: {
						accept: 'application/json'
					}
				}).then(function(response) {
					return response.data;
				});
			};

			return model;
		}
	]);
})();
