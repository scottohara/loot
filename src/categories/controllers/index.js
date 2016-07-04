{
	/**
	 * Implementation
	 */
	class CategoryIndexController {
		constructor($scope, $uibModal, $timeout, $state, categoryModel, ogTableNavigableService, categories) {
			const self = this;

			this.$scope = $scope;
			this.$uibModal = $uibModal;
			this.$timeout = $timeout;
			this.$state = $state;
			this.categoryModel = categoryModel;
			this.ogTableNavigableService = ogTableNavigableService;
			this.categories = angular.copy(categories).reduce((flattened, category) => {
				const children = category.children;

				Reflect.deleteProperty(category, "children");

				return flattened.concat(category, children);
			}, []);
			this.tableActions = {
				selectAction() {
					$state.go(".transactions");
				},
				editAction(index) {
					self.editCategory(index);
				},
				insertAction() {
					self.editCategory();
				},
				deleteAction(index) {
					self.deleteCategory(index);
				},
				focusAction(index) {
					$state.go(`${$state.includes("**.category") ? "^" : ""}.category`, {id: self.categories[index].id});
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			this.$scope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => this.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams));
		}

		editCategory(index) {
			// Helper function to sort by direction, then by category name, then by subcategory name
			function byDirectionAndName(a, b) {
				let x, y;

				if (a.direction === b.direction) {
					x = a.parent ? `${a.parent.name}#${a.name}` : a.name;
					y = b.parent ? `${b.parent.name}#${b.name}` : b.name;
				} else {
					x = a.direction;
					y = b.direction;
				}

				return x < y ? -1 : x > y ? 1 : 0;
			}

			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "categories/views/edit.html",
				controller: "CategoryEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					category: () => {
						let category;

						// If we didn't get an index, we're adding a new category so just return null
						if (!isNaN(index)) {
							category = this.categories[index];

							// Add the category to the LRU cache
							this.categoryModel.addRecent(category);
						}

						return category;
					}
				}
			}).result.then(category => {
				let parentIndex;

				if (isNaN(index)) {
					// Add new category to the end of the array
					this.categories.push(category);

					// Add the category to the LRU cache
					this.categoryModel.addRecent(category);

					// If the new category has a parent, increment the parent's children count
					if (!isNaN(category.parent_id)) {
						// Find the parent category by it's id
						parentIndex = this.categoryIndexById(category.parent_id);

						// If found, increment the number of children
						if (!isNaN(parentIndex)) {
							this.categories[parentIndex].num_children++;
						}
					}
				} else {
					// If the edited category parent has changed, increment/decrement the parent(s) children count
					if (category.parent_id !== this.categories[index].parent_id) {
						// Decrement the original parent (if required)
						if (!isNaN(this.categories[index].parent_id)) {
							parentIndex = this.categoryIndexById(this.categories[index].parent_id);
							if (!isNaN(parentIndex)) {
								this.categories[parentIndex].num_children--;
							}
						}

						// Increment the new parent (if required)
						if (!isNaN(category.parent_id)) {
							parentIndex = this.categoryIndexById(category.parent_id);
							if (!isNaN(parentIndex)) {
								this.categories[parentIndex].num_children++;
							}
						}
					}

					// Update the existing category in the array
					this.categories[index] = category;
				}

				// Resort the array
				this.categories.sort(byDirectionAndName);

				// Refocus the category
				this.focusCategory(category.id);
			}).finally(() => (this.ogTableNavigableService.enabled = true));
		}

		deleteCategory(index) {
			// Check if the category can be deleted
			this.categoryModel.find(this.categories[index].id).then(category => {
				// Disable navigation on the table
				this.ogTableNavigableService.enabled = false;

				let modalOptions = {
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
							alert: () => ({
								header: "Category has existing transactions",
								message: "You must first delete these transactions, or reassign to another category before attempting to delete this category."
							})
						}
					}, modalOptions);
				} else {
					// Show the delete category modal
					modalOptions = angular.extend({
						templateUrl: "categories/views/delete.html",
						controller: "CategoryDeleteController",
						controllerAs: "vm",
						resolve: {
							category: () => this.categories[index]
						}
					}, modalOptions);
				}

				// Show the modal
				this.$uibModal.open(modalOptions).result.then(() => {
					// If the deleted category has a parent, decrement the parent's children count
					if (!isNaN(this.categories[index].parent_id)) {
						// Find the parent category by it's id
						const parentIndex = this.categoryIndexById(this.categories[index].parent_id);

						// If found, decrement the number of children
						if (!isNaN(parentIndex)) {
							this.categories[parentIndex].num_children--;
						}
					}

					// Remove the category (and any children) from the array
					this.categories.splice(index, 1 + this.categories[index].num_children);

					// Go back to the parent state
					this.$state.go("root.categories");
				}).finally(() => (this.ogTableNavigableService.enabled = true));
			});
		}

		toggleFavourite(index) {
			this.categoryModel.toggleFavourite(this.categories[index]).then(favourite => (this.categories[index].favourite = favourite));
		}

		// Finds a specific category and focusses that row in the table
		focusCategory(categoryIdToFocus) {
			// Find the category by it's id
			const	targetIndex = this.categoryIndexById(categoryIdToFocus),
						delay = 50;

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				this.$timeout(() => this.tableActions.focusRow(targetIndex), delay);
			}

			return targetIndex;
		}

		// Helper function to find a category by it's id and return it's index
		categoryIndexById(id) {
			let targetIndex;

			angular.forEach(this.categories, (category, index) => {
				if (isNaN(targetIndex) && category.id === id) {
					targetIndex = index;
				}
			});

			return targetIndex;
		}

		// Listen for state change events, and when the security id changes, ensure the row is focussed
		stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				this.focusCategory(Number(toParams.id));
			}
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.controller("CategoryIndexController", CategoryIndexController);

	/**
	 * Dependencies
	 */
	CategoryIndexController.$inject = ["$scope", "$uibModal", "$timeout", "$state", "categoryModel", "ogTableNavigableService", "categories"];
}
