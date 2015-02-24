(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSecurities")
		.controller("SecurityEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "securityModel", "security"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, securityModel, security) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.security = angular.extend({}, security);
		vm.mode = security ? "Edit" : "Add";
		vm.save = save;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Save and close the modal
		function save() {
			vm.errorMessage = null;
			securityModel.save(vm.security).then(function(security) {
				$modalInstance.close(security.data);
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
