(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('accounts');

	// Declare the Account model
	mod.factory('accountModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('accounts');

			// Retrieves the list of accounts
			model.all = function(includeBalances) {
				return $http.get('/accounts' + (includeBalances ? "?include_balances" : ""), {
					cache: includeBalances ? false : cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of accounts, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Retrieves a single account by it's ID
			model.find = function(id) {
				return $http.get('/accounts/' + id, {
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			// Updates all pending transactions for an account to cleared
			model.reconcile = function(id) {
				return $http({
					method: 'PATCH',
					url: '/accounts/' + id + '/reconcile'
				});
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
