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
			model.all = function(parent) {
				return $http.get('/categories', {
					params: {
						parent: parent
					},
					cache: cache
				}).then(function(response) {
					return response.data;
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
