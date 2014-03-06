(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category model
	mod.factory('categoryModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves the list of categories
			model.all = function(parent) {
				return $http.get('/categories', {
					headers: {
						accept: 'application/json'
					},
					params: {
						parent: parent
					},
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			return model;
		}
	]);
})();
