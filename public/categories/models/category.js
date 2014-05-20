(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category model
	mod.factory('categoryModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('categories');

			// Retrieves the list of categories
			model.all = function(parent, includeChildren) {
				return $http.get('/categories' + (includeChildren ? "?include_children" : ""), {
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

			// Saves a category
			model.save = function(category) {
				// Flush the $http cache
				model.flush();

				return $http({
					method: category.id ? 'PATCH' : 'POST',
					url: '/categories' + (category.id ? '/' + category.id : ''),
					data: category
				});
			};

			// Deletes a category
			model.destroy = function(category) {
				// Flush the $http cache
				model.flush();

				return $http.delete('/categories/' + category.id);
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
