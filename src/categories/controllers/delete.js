{
	/**
	 * Implementation
	 */
	class CategoryDeleteController {
		constructor($uibModalInstance, categoryModel, category) {
			this.$uibModalInstance = $uibModalInstance;
			this.categoryModel = categoryModel;
			this.category = category;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteCategory() {
			this.errorMessage = null;
			this.categoryModel.destroy(this.category).then(() => this.$uibModalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$uibModalInstance.dismiss();
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
	CategoryDeleteController.$inject = ["$uibModalInstance", "categoryModel", "category"];
}
