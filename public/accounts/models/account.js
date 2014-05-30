(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('accounts');

	// Declare the Account model
	mod.factory('accountModel', ['$http', '$cacheFactory', '$window',
		function($http, $cacheFactory, $window) {
			var	model = {},
					cache = $cacheFactory('accounts');

			// Returns the model type
			model.type = function() {
				return "account";
			};

			// Returns the API path
			model.path = function(id) {
				return '/accounts' + (id ? '/' + id : '');
			};

			// Retrieves the list of accounts
			model.all = function(includeBalances) {
				return $http.get(model.path() + (includeBalances ? "?include_balances" : ""), {
					cache: includeBalances ? false : cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of accounts, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Retrieves a single account
			model.find = function(id) {
				return $http.get(model.path(id), {
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			// Updates all pending transactions for an account to cleared
			model.reconcile = function(id) {
				return $http({
					method: 'PATCH',
					url: model.path(id) + '/reconcile'
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
