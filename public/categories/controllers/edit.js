(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootCategories")
		.controller("CategoryEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "filterFilter", "limitToFilter", "categoryModel", "category"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, filterFilter, limitToFilter, categoryModel, category) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.category = angular.extend({}, category);
		vm.mode = category ? "Edit" : "Add";
		vm.parentCategories = parentCategories;
		vm.save = save;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// List of parent categories for the typeahead
		function parentCategories(filter, limit) {
			return categoryModel.all().then(function(categories) {
				return limitToFilter(filterFilter(categories, {name: filter}), limit);
			});
		}

		// Save and close the modal
		function save() {
			// Copy the parent details
			if (vm.category.parent) {
				vm.category.direction = vm.category.parent.direction;
				vm.category.parent_id = vm.category.parent.id;
			} else {
				vm.category.parent_id = null;
			}

			vm.errorMessage = null;
			categoryModel.save(vm.category).then(function(category) {
				$modalInstance.close(category.data);
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without saving
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
