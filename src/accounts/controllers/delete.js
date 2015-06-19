{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, accountModel, account) {
			this.$modalInstance = $modalInstance;
			this.accountModel = accountModel;
			this.account = account;
			this.errorMessage = null;

			// Capitalise the account type and status
			this.account.account_type = `${this.account.account_type.charAt(0).toUpperCase()}${this.account.account_type.substr(1)}`;
			this.account.status = `${this.account.status.charAt(0).toUpperCase()}${this.account.status.substr(1)}`;
		}

		// Delete and close the modal
		deleteAccount() {
			this.errorMessage = null;
			this.accountModel.destroy(this.account).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

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
}
