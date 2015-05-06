(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountReconcileController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "$window", "account"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, $window, account) {
		var vm = this;
		var LOCAL_STORAGE_KEY = "lootClosingBalance-" + account.id;

		/**
		 * Interface
		 */
		vm.closingBalance = Number($window.localStorage.getItem(LOCAL_STORAGE_KEY));
		vm.expectNegativeBalance = ["credit", "loan"].indexOf(account.account_type) !== -1;
		vm.start = start;
		vm.cancel = cancel;

		/**
		 * Implementation
		 */

		// Save and close the modal
		function start() {
			// Store the closing balance in local storage
			$window.localStorage.setItem(LOCAL_STORAGE_KEY, vm.closingBalance);

			// Close the modal and return the balance
			$modalInstance.close(vm.closingBalance);
		}

		// Dismiss the modal without saving
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
