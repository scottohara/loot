{
	/**
	 * Implementation
	 */

	class AccountEditController {
		constructor($modalInstance, filterFilter, limitToFilter, accountModel, account) {
			this.$modalInstance = $modalInstance;
			this.filterFilter = filterFilter;
			this.limitToFilter = limitToFilter;
			this.accountModel = accountModel;
			this.account = angular.extend({opening_balance: 0}, account);
			this.mode = account ? "Edit" : "Add";
			this.errorMessage = null;

			// Capitalise the account type and status
			if (account) {
				this.account.account_type = `${this.account.account_type.charAt(0).toUpperCase()}${this.account.account_type.substr(1)}`;
				this.account.status = `${this.account.status.charAt(0).toUpperCase()}${this.account.status.substr(1)}`;
			}
		}

		// List of account types for the typeahead
		accountTypes(filter) {
			return this.filterFilter(["Asset", "Bank", "Cash", "Credit", "Investment", "Liability", "Loan"], filter);
		}

		// Handler for account type changes
		accountTypeSelected() {
			if ("Investment" === this.account.account_type) {
				this.account.related_account = {
					opening_balance: 0
				};
			} else {
				this.account.related_account = null;
			}
		}

		// List of accounts for the typeahead
		accounts(filter, limit) {
			return this.accountModel.all().then(accounts => this.limitToFilter(this.filterFilter(accounts, {name: filter, account_type: "asset"}), limit));
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;

			// Convert the account type & status to lower case
			this.account.account_type = this.account.account_type.toLowerCase();
			this.account.status = this.account.status.toLowerCase();

			this.accountModel.save(this.account).then(account => this.$modalInstance.close(account.data), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountEditController", AccountEditController);

	/**
	 * Dependencies
	 */
	AccountEditController.$inject = ["$modalInstance", "filterFilter", "limitToFilter", "accountModel", "account"];
}
