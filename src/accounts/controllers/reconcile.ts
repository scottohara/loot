import {Account} from "accounts/types";
import {IModalInstanceService} from "angular-ui-bootstrap";

export default class AccountReconcileController {
	public readonly closingBalance: number;

	public readonly expectNegativeBalance: boolean;

	private readonly LOCAL_STORAGE_KEY: string;

	public constructor(private readonly $uibModalInstance: IModalInstanceService,
											private readonly $window: angular.IWindowService, account: Account) {
		this.LOCAL_STORAGE_KEY = `lootClosingBalance-${account.id}`;
		this.closingBalance = Number(this.$window.localStorage.getItem(this.LOCAL_STORAGE_KEY));
		this.expectNegativeBalance = ["credit", "loan"].indexOf(account.account_type) !== -1;
	}

	// Save and close the modal
	public start(): void {
		// Store the closing balance in local storage
		this.$window.localStorage.setItem(this.LOCAL_STORAGE_KEY, String(this.closingBalance));

		// Close the modal and return the balance
		this.$uibModalInstance.close(this.closingBalance);
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

AccountReconcileController.$inject = ["$uibModalInstance", "$window", "account"];