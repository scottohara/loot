(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("categories");

	// Declare the Category Edit controller
	mod.controller("categoryEditController", ["$scope", "$modalInstance", "filterFilter", "limitToFilter", "categoryModel", "category",
		function($scope, $modalInstance, filterFilter, limitToFilter, categoryModel, category) {
			// Make the passed category available on the scope
			$scope.category = angular.extend({}, category);
			$scope.mode = (category ? "Edit" : "Add");

			// List of parent categories for the typeahead
			$scope.parentCategories = function(filter, limit) {
				return categoryModel.all().then(function(categories) {
					return limitToFilter(filterFilter(categories, filter), limit);
				});
			};

			// Save and close the modal
			$scope.save = function() {
				// Copy the parent details
				if ($scope.category.parent) {
					$scope.category.direction = $scope.category.parent.direction;
					$scope.category.parent_id = $scope.category.parent.id;
				} else {
					$scope.category.parent_id = null;
				}

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
