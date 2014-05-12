(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('accounts');

	// Declare the Account model
	mod.factory('accountModel', ['$http', '$cacheFactory', '$window',
		function($http, $cacheFactory, $window) {
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

			var UNRECONCILED_ONLY_LOCAL_STORAGE_KEY = 'lootUnreconciledOnly-';

			// Get the unreconciled only setting for an account from local storage
			model.isUnreconciledOnly = function(id) {
				return $window.localStorage.getItem(UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id) !== 'false';
			};

			// Set the unreconciled only setting for an account in local storage
			model.unreconciledOnly = function(id, unreconciledOnly) {
				$window.localStorage.setItem(UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id, unreconciledOnly);
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
