(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAuthentication")
		.controller("AuthenticationEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "authenticationModel"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, authenticationModel) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.userName = null;
		vm.password = null;
		vm.login = login;
		vm.cancel = cancel;
		vm.errorMessage = null;
		vm.loginInProgress = false;

		/**
		 * Implementation
		 */

		// Login and close the modal
		function login() {
			vm.errorMessage = null;
			vm.loginInProgress = true;
			authenticationModel.login(vm.userName, vm.password).then(function() {
				$modalInstance.close();
			}, function(error) {
				vm.errorMessage = error.data;
				vm.loginInProgress = false;
			});
		}

		// Dismiss the modal without logging in
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
