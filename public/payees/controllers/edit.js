(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("payees")
		.controller("PayeeEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "payeeModel", "payee"];

	/**
	 * Implementation
	 */

	// Declare the Payee Edit controller
	function Controller($modalInstance, payeeModel, payee) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.payee = angular.extend({}, payee);
		vm.mode = payee ? "Edit" : "Add";
		vm.save = save;
		vm.cancel = cancel;
		vm.errorMessgae = null;

		/**
		 * Implementation
		 */

		// Save and close the modal
		function save() {
			vm.errorMessage = null;
			payeeModel.save(vm.payee).then(function(payee) {
				$modalInstance.close(payee.data);
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
