(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('categories');

	// Declare the Category Index controller
	mod.controller('categoryIndexController', ['$scope', '$modal', '$timeout', '$state', 'categoryModel', 'categories',
		function($scope, $modal, $timeout, $state, categoryModel, categories) {
			// Flatten the categories and subcategories and store on the scope
			$scope.categories = categories.reduce(function(flattened, category) {
				var children = category.children;
				delete category.children;
				return flattened.concat(category, children);
			}, []);

			var editCategory = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'categories/views/edit.html',
					controller: 'categoryEditController',
					backdrop: 'static',
					resolve: {
						category: function() {
							// If we didn't get an index, we're adding a new category so just return null
							if (isNaN(index)) {
								return null;
							}

							return $scope.categories[index];
						}
					}
				}).result.then(function(category) {
					if (isNaN(index)) {
						// Add new category to the end of the array
						$scope.categories.push(category);
					} else {
						// Update the existing category in the array
						$scope.categories[index] = category;
					}

					// Resort the array
					$scope.categories.sort(byDirectionAndName);

					// Refocus the category
					focusCategory(category.id);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deleteCategory = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'categories/views/delete.html',
					controller: 'categoryDeleteController',
					backdrop: 'static',
					resolve: {
						category: function() {
							return $scope.categories[index];
						}
					}
				}).result.then(function() {
					// Remove the category (and any children) from the array
					$scope.categories.splice(index, 1 + $scope.categories[index].num_children);

					// Go back to the parent state
					$state.go('root.categories');
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !$scope.navigationDisabled;
				},
				selectAction: editCategory,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					editCategory();
				},
				deleteAction: deleteCategory,
				focusAction: function(index) {
					$state.go('root.categories.category', {
						categoryId: $scope.categories[index].id
					});
				}
			};

			// Finds a specific category and focusses that row in the table
			var focusCategory = function(categoryIdToFocus) {
				var targetIndex;

				// Find the category by it's id
				angular.forEach($scope.categories, function(category, index) {
					if (isNaN(targetIndex) && category.id === categoryIdToFocus) {
						targetIndex = index;
					}
				});

				// If found, focus the row
				if (!isNaN(targetIndex)) {
					$timeout(function() {
						$scope.tableActions.focusRow(targetIndex);
					}, 50);
				}

				return targetIndex;
			};

			// Helper function to sort by direction, then by category name, then by subcategory name
			var byDirectionAndName = function(a, b) {
				var x, y;

				if (a.direction === b.direction) {
					x = a.parent ? a.parent.name + "#" + a.name : a.name;
					y = b.parent ? b.parent.name + "#" + b.name : b.name;
				} else {
					x = a.direction;
					y = b.direction;
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Listen for state change events, and when the categoryId changes, ensure the row is focussed
			$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
				if (toParams.categoryId && toParams.categoryId !== fromParams.categoryId) {
					focusCategory(Number(toParams.categoryId));
				}
			});
		}
	]);
})();
