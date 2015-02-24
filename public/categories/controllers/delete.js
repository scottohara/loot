(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.controller("CategoryDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "categoryModel", "category"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, categoryModel, category) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.category = category;
		vm.deleteCategory = deleteCategory;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deleteCategory() {
			vm.errorMessage = null;
			categoryModel.destroy(vm.category).then(function() {
				$modalInstance.close();
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without deleting
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
