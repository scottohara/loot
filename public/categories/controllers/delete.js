(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category Delete controller
	mod.controller('categoryDeleteController', ['$scope', '$modalInstance', 'categoryModel', 'category',
		function($scope, $modalInstance, categoryModel, category) {
			// Make the passed category available on the scope
			$scope.category = category;

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				categoryModel.destroy($scope.category).then(function() {
					$modalInstance.close();
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without deleting
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
