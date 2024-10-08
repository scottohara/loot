import "~/accounts/css/index.css";
import type { Account, Accounts } from "~/accounts/types";
import AccountDeleteView from "~/accounts/views/delete.html";
import AccountEditView from "~/accounts/views/edit.html";
import type AccountModel from "~/accounts/models/account";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import OgModalAlertView from "~/og-components/og-modal-alert/views/alert.html";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import angular from "angular";

export default class AccountIndexController {
	private readonly keydownHandler: (event: JQuery.KeyDownEvent) => void;

	private readonly showError: (message?: unknown) => void;

	public constructor(
		private readonly $scope: angular.IScope,
		$window: angular.IWindowService,
		private readonly $uibModal: angular.ui.bootstrap.IModalService,
		private readonly accountModel: AccountModel,
		ogModalErrorService: OgModalErrorService,
		public readonly accounts: Accounts,
	) {
		this.keydownHandler = (event: JQuery.KeyDownEvent): void =>
			this.keyHandler(event);
		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// Handler is wrapped in a function to aid with unit testing
		$window.$(document).on("keydown", this.keydownHandler);

		// When the controller scope is destroyed, remove they keydown event handler
		this.$scope.$on(
			"$destroy",
			(): unknown =>
				$window.$(document).off("keydown", this.keydownHandler) as unknown,
		);
	}

	public get netWorth(): number {
		return Object.keys(this.accounts).reduce(
			(memo: number, accountType: string): number =>
				memo + this.accounts[accountType].total,
			0,
		);
	}

	public editAccount(accountType?: string, index?: number): void {
		// Helper function to sort by account name
		function byName(a: Account, b: Account): number {
			return a.name.localeCompare(b.name);
		}

		// Show the modal
		this.$uibModal
			.open({
				templateUrl: AccountEditView,
				controller: "AccountEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					account: (): Account | undefined => {
						let account: Account | undefined;

						// If we didn't get an index, we're adding a new account so just return null
						if (
							undefined !== accountType &&
							undefined !== index &&
							!isNaN(index)
						) {
							account = this.accounts[accountType].accounts[index];

							// Add the account to the LRU cache
							this.accountModel.addRecent(account);
						}

						return account;
					},
				},
			})
			.result.then((account: Account): void => {
				const currentAccountType = `${
					account.account_type.charAt(0).toUpperCase() +
					account.account_type.substring(1)
				} accounts`;

				if (undefined === accountType || undefined === index || isNaN(index)) {
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
			})
			.catch(this.showError);
	}

	public deleteAccount(accountType: string, index: number): void {
		// Check if the account can be deleted
		this.accountModel
			.find(Number(this.accounts[accountType].accounts[index].id))
			.then((account: Account): void => {
				let modalOptions: angular.ui.bootstrap.IModalSettings = {
					backdrop: "static",
				};

				// Check if the account has any transactions
				if (account.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend(
						{
							templateUrl: OgModalAlertView,
							controller: "OgModalAlertController",
							controllerAs: "vm",
							resolve: {
								alert: (): OgModalAlert => ({
									header: "Account has existing transactions",
									message:
										"You must first delete these transactions, or reassign to another account before attempting to delete this account.",
								}),
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				} else {
					// Show the delete account modal
					modalOptions = angular.extend(
						{
							templateUrl: AccountDeleteView,
							controller: "AccountDeleteController",
							controllerAs: "vm",
							resolve: {
								account: (): Account =>
									this.accounts[accountType].accounts[index],
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				}

				// Show the modal
				this.$uibModal
					.open(modalOptions)
					.result.then((): void => {
						this.accounts[accountType].accounts.splice(index, 1);

						// Recalculate the array total
						this.calculateAccountTypeTotal(accountType);
					})
					.catch(this.showError);
			})
			.catch(this.showError);
	}

	public toggleFavourite(accountType: string, index: number): void {
		const account = this.accounts[accountType].accounts[index];

		this.accountModel
			.toggleFavourite(account)
			.then((favourite: boolean): boolean => (account.favourite = favourite))
			.catch(this.showError);
	}

	// Declare key handler for inserting a new account
	private keyHandler(event: JQuery.KeyDownEvent): void {
		// Check if the Insert key or CTRL+N keys were pressed
		if (
			"Insert" === event.key ||
			(event.ctrlKey && "N" === event.key.toUpperCase())
		) {
			this.editAccount();
			event.preventDefault();
		}
	}

	private calculateAccountTypeTotal(accountType: string): void {
		this.accounts[accountType].total = this.accounts[
			accountType
		].accounts.reduce(
			(memo: number, account: Account): number =>
				memo + account.closing_balance,
			0,
		);
	}
}

AccountIndexController.$inject = [
	"$scope",
	"$window",
	"$uibModal",
	"accountModel",
	"ogModalErrorService",
	"accounts",
];
