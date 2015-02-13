(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("payees")
		.controller("PayeeDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "payeeModel", "payee"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, payeeModel, payee) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.payee = payee;
		vm.deletePayee = deletePayee;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deletePayee() {
			vm.errorMessage = null;
			payeeModel.destroy(vm.payee).then(function() {
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
