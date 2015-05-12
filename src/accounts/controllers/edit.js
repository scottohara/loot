(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "filterFilter", "limitToFilter", "accountModel", "account"];

	/**
	 * Implementation
	 */

	// Declare the Account Edit controller
	function Controller($modalInstance, filterFilter, limitToFilter, accountModel, account) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.account = angular.extend({opening_balance: 0}, account);
		vm.mode = account ? "Edit" : "Add";
		vm.accountTypes = accountTypes;
		vm.accountTypeSelected = accountTypeSelected;
		vm.accounts = accounts;
		vm.save = save;
		vm.cancel = cancel;
		vm.errorMessage = null;

		// Capitalise the account type and status
		if (account) {
			vm.account.account_type = vm.account.account_type.charAt(0).toUpperCase() + vm.account.account_type.substr(1);
			vm.account.status = vm.account.status.charAt(0).toUpperCase() + vm.account.status.substr(1);
		}

		/**
		 * Implementation
		 */

		// List of account types for the typeahead
		function accountTypes(filter, limit) {
			return limitToFilter(filterFilter(["Asset", "Bank", "Cash", "Credit", "Investment", "Liability", "Loan"], filter), limit);
		}

		// Handler for account type changes
		function accountTypeSelected() {
			if ("Investment" === vm.account.account_type) {
				vm.account.related_account = {
					opening_balance: 0
				};
			} else {
				vm.account.related_account = null;
			}
		}

		// List of accounts for the typeahead
		function accounts(filter, limit) {
			return accountModel.all().then(function(accounts) {
				return limitToFilter(filterFilter(accounts, {name: filter, account_type: "asset"}), limit);
			});
		}

		// Save and close the modal
		function save() {
			vm.errorMessage = null;

			// Convert the account type & status to lower case
			vm.account.account_type = vm.account.account_type.toLowerCase();
			vm.account.status = vm.account.status.toLowerCase();

			accountModel.save(vm.account).then(function(account) {
				$modalInstance.close(account.data);
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
