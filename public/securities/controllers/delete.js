(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("securities")
		.controller("SecurityDeleteController", Controller);

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
		vm.security = security;
		vm.deleteSecurity = deleteSecurity;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deleteSecurity() {
			vm.errorMessage = null;
			securityModel.destroy(vm.security).then(function() {
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
