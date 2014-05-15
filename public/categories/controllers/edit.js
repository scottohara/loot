(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category Edit controller
	mod.controller('categoryEditController', ['$scope', '$modalInstance', 'categoryModel', 'category',
		function($scope, $modalInstance, categoryModel, category) {
			// Make the passed category available on the scope
			$scope.category = angular.extend({
			}, category);

			$scope.mode = (category ? "Edit" : "Add");

			// Give the name field initial focus
			$("#name").focus();

			// Save and close the modal
			$scope.save = function() {
				$scope.errorMessage = null;
				categoryModel.save($scope.category).then(function(category) {
					$modalInstance.close(category.data);
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without saving
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
