{
	/**
	 * Implementation
	 */
	class AccountReconcileController {
		constructor($uibModalInstance, $window, account) {
			this.$uibModalInstance = $uibModalInstance;
			this.$window = $window;
			this.account = account;
			this.LOCAL_STORAGE_KEY = `lootClosingBalance-${account.id}`;
			this.closingBalance = Number(this.$window.localStorage.getItem(this.LOCAL_STORAGE_KEY));
			this.expectNegativeBalance = ["credit", "loan"].indexOf(this.account.account_type) !== -1;
		}

		// Save and close the modal
		start() {
			// Store the closing balance in local storage
			this.$window.localStorage.setItem(this.LOCAL_STORAGE_KEY, this.closingBalance);

			// Close the modal and return the balance
			this.$uibModalInstance.close(this.closingBalance);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountReconcileController", AccountReconcileController);

	/**
	 * Dependencies
	 */
	AccountReconcileController.$inject = ["$uibModalInstance", "$window", "account"];
}
