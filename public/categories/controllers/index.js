(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("categories")
		.controller("CategoryIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "$timeout", "$state", "categoryModel", "ogTableNavigableService", "categories"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, $timeout, $state, categoryModel, ogTableNavigableService, categories) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.categories = angular.copy(categories).reduce(flattenCategories, []);
		vm.editCategory = editCategory;
		vm.focusCategory = focusCategory;
		vm.deleteCategory = deleteCategory;
		vm.tableActions = tableActions();
		vm.stateChangeSuccessHandler = stateChangeSuccessHandler;

		/**
		 * Implementation
		 */

		// Flatten the categories and subcategories
		function flattenCategories(flattened, category) {
			var children = category.children;
			delete category.children;
			return flattened.concat(category, children);
		}

		function editCategory(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "categories/views/edit.html",
				controller: "CategoryEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					category: function() {
						var category;

						// If we didn't get an index, we're adding a new category so just return null
						if (!isNaN(index)) {
							category = vm.categories[index];

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
					vm.categories.push(category);

					// Add the category to the LRU cache
					categoryModel.addRecent(category);

					// If the new category has a parent, increment the parent's children count
					if (!isNaN(category.parent_id)) {
						// Find the parent category by it's id
						parentIndex = categoryIndexById(category.parent_id);

						// If found, increment the number of children
						if (!isNaN(parentIndex)) {
							vm.categories[parentIndex].num_children++;
						}
					}
				} else {
					// If the edited category parent has changed, increment/decrement the parent(s) children count
					if (category.parent_id !== vm.categories[index].parent_id) {
						// Decrement the original parent (if required)
						if (!isNaN(vm.categories[index].parent_id)) {
							parentIndex = categoryIndexById(vm.categories[index].parent_id);
							if (!isNaN(parentIndex)) {
								vm.categories[parentIndex].num_children--;
							}
						}

						// Increment the new parent (if required)
						if (!isNaN(category.parent_id)) {
							parentIndex = categoryIndexById(category.parent_id);
							if (!isNaN(parentIndex)) {
								vm.categories[parentIndex].num_children++;
							}
						}
					}

					// Update the existing category in the array
					vm.categories[index] = category;
				}

				// Resort the array
				vm.categories.sort(byDirectionAndName);

				// Refocus the category
				vm.focusCategory(category.id);
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		function deleteCategory(index) {
			// Check if the category can be deleted
			categoryModel.find(vm.categories[index].id).then(function(category) {
				// Disable navigation on the table
				ogTableNavigableService.enabled = false;

				var modalOptions = {
					backdrop: "static"
				};

				// Check if the category has any transactions
				if (category.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend({
						templateUrl: "og-components/og-modal-alert/views/alert.html",
						controller: "OgModalAlertController",
						controllerAs: "vm",
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
						controller: "CategoryDeleteController",
						controllerAs: "vm",
						resolve: {
							category: function() {
								return vm.categories[index];
							}
						}
					}, modalOptions);
				}

				// Show the modal
				$modal.open(modalOptions).result.then(function() {
					// If the deleted category has a parent, decrement the parent's children count
					if (!isNaN(vm.categories[index].parent_id)) {
						// Find the parent category by it's id
						var parentIndex = categoryIndexById(vm.categories[index].parent_id);

						// If found, decrement the number of children
						if (!isNaN(parentIndex)) {
							vm.categories[parentIndex].num_children--;
						}
					}

					// Remove the category (and any children) from the array
					vm.categories.splice(index, 1 + vm.categories[index].num_children);

					// Go back to the parent state
					$state.go("root.categories");
				}).finally(function() {
					// Enable navigation on the table
					ogTableNavigableService.enabled = true;
				});
			});
		}

		// Action handlers for navigable table
		function tableActions() {
			return {
				selectAction: function() {
					$state.go(".transactions");
				},
				editAction: vm.editCategory,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					vm.editCategory();
				},
				deleteAction: vm.deleteCategory,
				focusAction: function(index) {
					$state.go(($state.includes("**.category") ? "^" : "") + ".category", {
						id: vm.categories[index].id
					});
				}
			};
		}

		// Finds a specific category and focusses that row in the table
		function focusCategory(categoryIdToFocus) {
			// Find the category by it's id
			var targetIndex = categoryIndexById(categoryIdToFocus);

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				$timeout(function() {
					vm.tableActions.focusRow(targetIndex);
				}, 50);
			}

			return targetIndex;
		}

		// Helper function to find a category by it's id and return it's index
		function categoryIndexById(id) {
			var targetIndex;

			angular.forEach(vm.categories, function(category, index) {
				if (isNaN(targetIndex) && category.id === id) {
					targetIndex = index;
				}
			});

			return targetIndex;
		}

		// Helper function to sort by direction, then by category name, then by subcategory name
		function byDirectionAndName(a, b) {
			var x, y;

			if (a.direction === b.direction) {
				x = a.parent ? a.parent.name + "#" + a.name : a.name;
				y = b.parent ? b.parent.name + "#" + b.name : b.name;
			} else {
				x = a.direction;
				y = b.direction;
			}

			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		// Listen for state change events, and when the security id changes, ensure the row is focussed
		function stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				vm.focusCategory(Number(toParams.id));
			}
		}

		// Handler is wrapped in a function to aid with unit testing
		$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			vm.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
		});
	}
})();
