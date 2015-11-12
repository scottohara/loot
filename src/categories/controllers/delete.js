{
	/**
	 * Implementation
	 */
	class CategoryDeleteController {
		constructor($modalInstance, categoryModel, category) {
			this.$modalInstance = $modalInstance;
			this.categoryModel = categoryModel;
			this.category = category;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteCategory() {
			this.errorMessage = null;
			this.categoryModel.destroy(this.category).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.controller("CategoryDeleteController", CategoryDeleteController);

	/**
	 * Dependencies
	 */
	CategoryDeleteController.$inject = ["$modalInstance", "categoryModel", "category"];
}
