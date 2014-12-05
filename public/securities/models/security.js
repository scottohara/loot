(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securities");

	// Declare the Security model
	mod.factory("securityModel", ["$http", "$cacheFactory", "$window", "ogLruCacheFactory",
		function($http, $cacheFactory, $window, ogLruCacheFactory) {
			var	model = {},
					cache = $cacheFactory("securities"),
					LRU_LOCAL_STORAGE_KEY = "lootRecentSecurities",
					LRU_CAPACITY = 10,
					lruCache;

			// Create an LRU cache and populate with the recent account list from local storage
			lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse($window.localStorage.getItem(LRU_LOCAL_STORAGE_KEY)) || {});
			model.recent = lruCache.list();
			
			// Returns the model type
			model.type = function() {
				return "security";
			};

			// Returns the API path
			model.path = function(id) {
				return "/securities" + (id ? "/" + id : "");
			};

			// Retrieves the list of securities
			model.all = function(includeBalances) {
				return $http.get(model.path() + (includeBalances ? "?include_balances" : ""), {
					cache: includeBalances ? false : cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of securities, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Retrieves the most recent transaction for a security
			model.findLastTransaction = function(securityId, accountType) {
				return $http.get(model.path(securityId) + "/transactions/last", {
					params: {
						account_type: accountType
					}
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves a single security
			model.find = function(id) {
				return $http.get(model.path(id), {
					cache: cache
				}).then(function(response) {
					model.addRecent(response.data);
					return response.data;
				});
			};

			// Saves a security
			model.save = function(security) {
				// Flush the $http cache
				model.flush();

				return $http({
					method: security.id ? "PATCH" : "POST",
					url: model.path(security.id),
					data: security
				});
			};

			// Deletes a security
			model.destroy = function(security) {
				// Flush the $http cache
				model.flush();

				return $http.delete(model.path(security.id));
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
			model.addRecent = function(security) {
				// Put the item into the LRU cache
				model.recent = lruCache.put(security);

				// Update local storage with the new list
				$window.localStorage.setItem(LRU_LOCAL_STORAGE_KEY, JSON.stringify(lruCache.dump()));
			};

			return model;
		}
	]);
})();
