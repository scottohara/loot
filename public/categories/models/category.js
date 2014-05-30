(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category model
	mod.factory('categoryModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('categories');

			// Returns the model type
			model.type = function() {
				return "category";
			};

			// Returns the API path
			model.path = function(id) {
				return '/categories' + (id ? '/' + id : '');
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
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			// Saves a category
			model.save = function(category) {
				// Flush the $http cache
				model.flush();

				return $http({
					method: category.id ? 'PATCH' : 'POST',
					url: model.path(category.id),
					data: category
				});
			};

			// Deletes a category
			model.destroy = function(category) {
				// Flush the $http cache
				model.flush();

				return $http.delete(model.path(category.id));
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
