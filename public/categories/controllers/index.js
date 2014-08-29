(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("categories");

	// Declare the Category Index controller
	mod.controller("categoryIndexController", ["$scope", "$modal", "$timeout", "$state", "categoryModel", "categories",
		function($scope, $modal, $timeout, $state, categoryModel, categories) {
			// Flatten the categories and subcategories and store on the scope
			$scope.categories = angular.copy(categories).reduce(function(flattened, category) {
				var children = category.children;
				delete category.children;
				return flattened.concat(category, children);
			}, []);

			$scope.editCategory = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: "categories/views/edit.html",
					controller: "categoryEditController",
					backdrop: "static",
					resolve: {
						category: function() {
							var category;

							// If we didn't get an index, we're adding a new category so just return null
							if (!isNaN(index)) {
								category = $scope.categories[index];

								// Add the category to the LRU cache
								categoryModel.addRecent(category);
							}

							return category;
						}
					}
				}).result.then(function(category) {
					var parentIndex;

					if (isNaN(index)) {
						// Add new category to the end of the array
						$scope.categories.push(category);

						// Add the category to the LRU cache
						categoryModel.addRecent(category);

						// If the new category has a parent, increment the parent's children count
						if (!isNaN(category.parent_id)) {
							// Find the parent category by it's id
							parentIndex = categoryIndexById(category.parent_id);

							// If found, increment the number of children
							if (!isNaN(parentIndex)) {
								$scope.categories[parentIndex].num_children++;
							}
						}
					} else {
						// If the edited category parent has changed, increment/decrement the parent(s) children count
						if (category.parent_id !== $scope.categories[index].parent_id) {
							// Decrement the original parent (if required)
							if (!isNaN($scope.categories[index].parent_id)) {
								parentIndex = categoryIndexById($scope.categories[index].parent_id);
								if (!isNaN(parentIndex)) {
									$scope.categories[parentIndex].num_children--;
								}
							}

							// Increment the new parent (if required)
							if (!isNaN(category.parent_id)) {
								parentIndex = categoryIndexById(category.parent_id);
								if (!isNaN(parentIndex)) {
									$scope.categories[parentIndex].num_children++;
								}
							}
						}

						// Update the existing category in the array
						$scope.categories[index] = category;
					}

					// Resort the array
					$scope.categories.sort(byDirectionAndName);

					// Refocus the category
					$scope.focusCategory(category.id);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			$scope.deleteCategory = function(index) {
				// Check if the category can be deleted
				categoryModel.find($scope.categories[index].id).then(function(category) {
					// Disable navigation on the table
					$scope.navigationDisabled = true;

					var modalOptions = {
						backdrop: "static"
					};

					// Check if the category has any transactions
					if (category.num_transactions > 0) {
						// Show an alert modal
						modalOptions = angular.extend({
							templateUrl: "og-components/og-modal-alert/views/alert.html",
							controller: "ogModalAlertController",
							resolve: {
								alert: function() {
									return {
										header: "Category has existing transactions",
										message: "You must first delete these transactions, or reassign to another category before attempting to delete this category."
									};
								}
							}
						}, modalOptions);
					} else {
						// Show the delete category modal
						modalOptions = angular.extend({
							templateUrl: "categories/views/delete.html",
							controller: "categoryDeleteController",
							resolve: {
								category: function() {
									return $scope.categories[index];
								}
							}
						}, modalOptions);
					}

					// Show the modal
					$modal.open(modalOptions).result.then(function() {
						// If the deleted category has a parent, decrement the parent's children count
						if (!isNaN($scope.categories[index].parent_id)) {
							// Find the parent category by it's id
							var parentIndex = categoryIndexById($scope.categories[index].parent_id);

							// If found, decrement the number of children
							if (!isNaN(parentIndex)) {
								$scope.categories[parentIndex].num_children--;
							}
						}

						// Remove the category (and any children) from the array
						$scope.categories.splice(index, 1 + $scope.categories[index].num_children);

						// Go back to the parent state
						$state.go("root.categories");
					}).finally(function() {
						// Enable navigation on the table
						$scope.navigationDisabled = false;
					});
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !($scope.navigationDisabled || $scope.navigationGloballyDisabled);
				},
				selectAction: function() {
					$state.go(".transactions");
				},
				editAction: $scope.editCategory,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editCategory();
				},
				deleteAction: $scope.deleteCategory,
				focusAction: function(index) {
					$state.go(($state.includes("**.category") ? "^" : "") + ".category", {
						id: $scope.categories[index].id
					});
				}
			};

			// Finds a specific category and focusses that row in the table
			$scope.focusCategory = function(categoryIdToFocus) {
				// Find the category by it's id
				var targetIndex = categoryIndexById(categoryIdToFocus);

				// If found, focus the row
				if (!isNaN(targetIndex)) {
					$timeout(function() {
						$scope.tableActions.focusRow(targetIndex);
					}, 50);
				}

				return targetIndex;
			};

			// Helper function to find a category by it's id and return it's index
			var categoryIndexById = function(id) {
				var targetIndex;

				angular.forEach($scope.categories, function(category, index) {
					if (isNaN(targetIndex) && category.id === id) {
						targetIndex = index;
					}
				});

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

			// Listen for state change events, and when the security id changes, ensure the row is focussed
			$scope.stateChangeSuccessHandler = function(event, toState, toParams, fromState, fromParams) {
				if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
					$scope.focusCategory(Number(toParams.id));
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
				$scope.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
			});
		}
	]);
})();
