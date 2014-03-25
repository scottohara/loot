(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category Index controller
	mod.controller('categoryIndexController', ['$scope', 'categoryModel',
		function($scope, categoryModel) {
			categoryModel.all().then(function(categories) {
				$scope.categories = categories;
			});
		}
	]);
})();
