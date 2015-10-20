{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($scope, $uibModal, accountModel, accounts) {
			this.$scope = $scope;
			this.$uibModal = $uibModal;
			this.accountModel = accountModel;
			this.accounts = accounts;
			this.keydownHandler = event => this.keyHandler(event);

			// Handler is wrapped in a function to aid with unit testing
			$(document).on("keydown", this.keydownHandler);

			// When the controller scope is destroyed, remove they keydown event handler
			this.$scope.$on("$destroy", () => $(document).off("keydown", this.keydownHandler));
		}

		editAccount(accountType, index) {
			// Helper function to sort by account name
			function byName(a, b) {
				const	x = a.name,
							y = b.name;

				return x < y ? -1 : x > y ? 1 : 0;
			}

			// Show the modal
			this.$uibModal.open({
				templateUrl: "accounts/views/edit.html",
				controller: "AccountEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					account: () => {
						let account;

						// If we didn't get an index, we're adding a new account so just return null
						if (accountType && !isNaN(index)) {
							account = this.accounts[accountType].accounts[index];

							// Add the account to the LRU cache
							this.accountModel.addRecent(account);
						}

						return account;
					}
				}
			}).result.then(account => {
				const currentAccountType = `${account.account_type.charAt(0).toUpperCase() + account.account_type.substring(1)} accounts`;

				if (!accountType || isNaN(index)) {
					// Add new account to the end of the array
					this.accounts[currentAccountType].accounts.push(account);

					// Add the account to the LRU cache
					this.accountModel.addRecent(account);
				} else if (currentAccountType === accountType) {
					// Update the existing account in the array
					this.accounts[accountType].accounts[index] = account;
				} else {
					// If the edited account type has changed, remove the account from the original array
					this.accounts[accountType].accounts.splice(index, 1);

					// Recalculate the array total
					this.calculateAccountTypeTotal(accountType);

					// Add the account to the end of the new array
					this.accounts[currentAccountType].accounts.push(account);
				}

				// Resort the array
				this.accounts[currentAccountType].accounts.sort(byName);

				// Recalculate the array total
				this.calculateAccountTypeTotal(currentAccountType);
			});
		}

		deleteAccount(accountType, index) {
			// Check if the account can be deleted
			this.accountModel.find(this.accounts[accountType].accounts[index].id).then(account => {
				let modalOptions = {
					backdrop: "static"
				};

				// Check if the account has any transactions
				if (account.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend({
						templateUrl: "og-components/og-modal-alert/views/alert.html",
						controller: "OgModalAlertController",
						controllerAs: "vm",
						resolve: {
							alert: () => ({
								header: "Account has existing transactions",
								message: "You must first delete these transactions, or reassign to another account before attempting to delete this account."
							})
						}
					}, modalOptions);
				} else {
					// Show the delete account modal
					modalOptions = angular.extend({
						templateUrl: "accounts/views/delete.html",
						controller: "AccountDeleteController",
						controllerAs: "vm",
						resolve: {
							account: () => this.accounts[accountType].accounts[index]
						}
					}, modalOptions);
				}

				// Show the modal
				this.$uibModal.open(modalOptions).result.then(() => {
					this.accounts[accountType].accounts.splice(index, 1);

					// Recalculate the array total
					this.calculateAccountTypeTotal(accountType);
				});
			});
		}

		get netWorth() {
			return Object.keys(this.accounts).reduce((memo, accountType) => memo + this.accounts[accountType].total, 0);
		}

		// Declare key handler for inserting a new account
		keyHandler(event) {
			const INSERT_KEY = 45,
						N_KEY = 78;

			// Check if the Insert key or CTRL+N keys were pressed
			if (INSERT_KEY === event.keyCode || event.ctrlKey && N_KEY === event.keyCode) {
				this.editAccount();
				event.preventDefault();
			}
		}

		calculateAccountTypeTotal(accountType) {
			this.accounts[accountType].total = this.accounts[accountType].accounts.reduce((memo, account) => memo + account.closing_balance, 0);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$uibModal", "accountModel", "accounts"];
}
