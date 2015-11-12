{
	/**
	 * Implementation
	 */
	class CategoryEditController {
		constructor($modalInstance, filterFilter, limitToFilter, categoryModel, category) {
			this.$modalInstance = $modalInstance;
			this.filterFilter = filterFilter;
			this.limitToFilter = limitToFilter;
			this.categoryModel = categoryModel;
			this.category = angular.extend({}, category);
			this.mode = category ? "Edit" : "Add";
			this.errorMessage = null;
		}

		// List of parent categories for the typeahead
		parentCategories(filter, limit) {
			return this.categoryModel.all().then(categories => this.limitToFilter(this.filterFilter(categories, {name: filter}), limit));
		}

		// Save and close the modal
		save() {
			// Copy the parent details
			if (this.category.parent) {
				this.category.direction = this.category.parent.direction;
				this.category.parent_id = this.category.parent.id;
			} else {
				this.category.parent_id = null;
			}

			this.errorMessage = null;
			this.categoryModel.save(this.category).then(category => this.$modalInstance.close(category.data), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.controller("CategoryEditController", CategoryEditController);

	/**
	 * Dependencies
	 */
	CategoryEditController.$inject = ["$modalInstance", "filterFilter", "limitToFilter", "categoryModel", "category"];
}
