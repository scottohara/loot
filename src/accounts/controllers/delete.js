(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "accountModel", "account"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, accountModel, account) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.account = account;
		vm.deleteAccount = deleteAccount;
		vm.cancel = cancel;
		vm.errorMessage = null;

		// Capitalise the account type and status
		vm.account.account_type = vm.account.account_type.charAt(0).toUpperCase() + vm.account.account_type.substr(1);
		vm.account.status = vm.account.status.charAt(0).toUpperCase() + vm.account.status.substr(1);

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deleteAccount() {
			vm.errorMessage = null;
			accountModel.destroy(vm.account).then(function() {
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
