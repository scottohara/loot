(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.factory("categoryModel", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$http", "$cacheFactory", "$window", "ogLruCacheFactory"];

	/**
	 * Implementation
	 */
	function Factory($http, $cacheFactory, $window, ogLruCacheFactory) {
		var	model = {},
				cache = $cacheFactory("categories"),
				LRU_LOCAL_STORAGE_KEY = "lootRecentCategories",
				LRU_CAPACITY = 10,
				lruCache;

		// Create an LRU cache and populate with the recent account list from local storage
		lruCache = ogLruCacheFactory(LRU_CAPACITY, JSON.parse($window.localStorage.getItem(LRU_LOCAL_STORAGE_KEY)) || {});
		model.recent = lruCache.list();
		
		// Returns the model type
		model.type = function() {
			return "category";
		};

		// Returns the API path
		model.path = function(id) {
			return "/categories" + (id ? "/" + id : "");
		};

		// Retrieves the list of categories
		model.all = function(parent, includeChildren) {
			return $http.get(model.path() + (includeChildren ? "?include_children" : ""), {
				params: {
					parent: parent
				},
				cache: includeChildren ? false : cache
			}).then(function(response) {
				return response.data;
			});
		};

		// Retrieves the list of categories, including children
		model.allWithChildren = function(parent) {
			return model.all(parent, true);
		};

		// Retrieves a single category
		model.find = function(id) {
			return $http.get(model.path(id), {
				cache: cache
			}).then(function(response) {
				model.addRecent(response.data);
				return response.data;
			});
		};

		// Saves a category
		model.save = function(category) {
			// Flush the $http cache
			model.flush();

			return $http({
				method: category.id ? "PATCH" : "POST",
				url: model.path(category.id),
				data: category
			});
		};

		// Deletes a category
		model.destroy = function(category) {
			// Flush the $http cache
			model.flush();

			return $http.delete(model.path(category.id)).then(function() {
				model.removeRecent(category.id);
			});
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
		model.addRecent = function(category) {
			// Put the item into the LRU cache
			model.recent = lruCache.put(category);

			// Update local storage with the new list
			$window.localStorage.setItem(LRU_LOCAL_STORAGE_KEY, JSON.stringify(lruCache.dump()));
		};

		// Remove an item from the LRU cache
		model.removeRecent = function(id) {
			// Remove the item from the LRU cache
			model.recent = lruCache.remove(id);

			// Update local storage with the new list
			$window.localStorage.setItem(LRU_LOCAL_STORAGE_KEY, JSON.stringify(lruCache.dump()));
		};

		return model;
	}
})();
