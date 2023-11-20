import type {
	Account,
	DisplayAccountStatus,
	DisplayAccountType,
} from "~/accounts/types";
import type AccountModel from "~/accounts/models/account";

export default class AccountDeleteController {
	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly accountModel: AccountModel,
		public readonly account: Account,
	) {
		// Capitalise the account type and status
		this.account.account_type = `${this.account.account_type
			.charAt(0)
			.toUpperCase()}${this.account.account_type.substr(
			1,
		)}` as DisplayAccountType;
		this.account.status = `${this.account.status
			.charAt(0)
			.toUpperCase()}${this.account.status.substr(1)}` as DisplayAccountStatus;
	}

	// Delete and close the modal
	public deleteAccount(): void {
		this.errorMessage = null;
		this.accountModel.destroy(this.account).then(
			(): void => this.$uibModalInstance.close(),
			(error: angular.IHttpResponse<string>): string =>
				(this.errorMessage = error.data),
		);
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

AccountDeleteController.$inject = [
	"$uibModalInstance",
	"accountModel",
	"account",
];
