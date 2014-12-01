(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accounts");

	// Declare the Account model
	mod.factory("accountModel", ["$http", "$cacheFactory", "$window", "ogLruCacheFactory",
		function($http, $cacheFactory, $window, ogLruCacheFactory) {
			var	model = {},
					cache = $cacheFactory("accounts"),
					UNRECONCILED_ONLY_LOCAL_STORAGE_KEY = "lootUnreconciledOnly-",
					LRU_LOCAL_STORAGE_KEY = "lootRecentAccounts",
					LRU_CAPACITY = 10,
					lruCache;

			// Create an LRU cache and populate with the recent account list from local storage
			lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse($window.localStorage.getItem(LRU_LOCAL_STORAGE_KEY)) || {});
			model.recent = lruCache.list();
			
			// Returns the model type
			model.type = function() {
				return "account";
			};

			// Returns the API path
			model.path = function(id) {
				return "/accounts" + (id ? "/" + id : "");
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
					cache: cache
				}).then(function(response) {
					model.addRecent(response.data);
					return response.data;
				});
			};

			// Updates all pending transactions for an account to cleared
			model.reconcile = function(id) {
				return $http({
					method: "PATCH",
					url: model.path(id) + "/reconcile"
				});
			};

			// Get the unreconciled only setting for an account from local storage
			model.isUnreconciledOnly = function(id) {
				return $window.localStorage.getItem(UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id) !== "false";
			};

			// Set the unreconciled only setting for an account in local storage
			model.unreconciledOnly = function(id, unreconciledOnly) {
				$window.localStorage.setItem(UNRECONCILED_ONLY_LOCAL_STORAGE_KEY + id, unreconciledOnly);
			};

			// Flush the cache
			model.flush = function(id) {
				if (id) {
					cache.remove(model.path(id));
				} else {
					cache.removeAll();
				}
			};

			// Put an item into the LRU cache
			model.addRecent = function(account) {
				// Put the item into the LRU cache
				model.recent = lruCache.put(account);

				// Update local storage with the new list
				$window.localStorage.setItem(LRU_LOCAL_STORAGE_KEY, JSON.stringify(lruCache.dump()));
			};

			return model;
		}
	]);
})();
