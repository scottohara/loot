import type {
	Account,
	DisplayAccountStatus,
	DisplayAccountType,
	StoredAccountStatus,
	StoredAccountType
} from "~/accounts/types";
import type AccountModel from "~/accounts/models/account";
import angular from "angular";

export default class AccountEditController {
	public readonly account: Account;

	public readonly mode: "Add" | "Edit";

	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly filterFilter: angular.IFilterFilter,
						private readonly limitToFilter: angular.IFilterLimitTo,
						private readonly accountModel: AccountModel,
						account: Account | undefined) {
		this.account = angular.extend({ opening_balance: 0 }, account) as Account;
		this.mode = undefined === account ? "Add" : "Edit";

		// Capitalise the account type and status
		if (undefined !== account) {
			this.account.account_type = `${this.account.account_type.charAt(0).toUpperCase()}${this.account.account_type.substr(1)}` as DisplayAccountType;
			this.account.status = `${this.account.status.charAt(0).toUpperCase()}${this.account.status.substr(1)}` as DisplayAccountStatus;
		}
	}

	// List of account types for the typeahead
	public accountTypes(filter?: string): DisplayAccountType[] {
		const types: DisplayAccountType[] = ["Asset", "Bank", "Cash", "Credit", "Investment", "Liability", "Loan"];

		return undefined === filter ? types : this.filterFilter(types, filter);
	}

	// Handler for account type changes
	public accountTypeSelected(): void {
		if ("Investment" === this.account.account_type) {
			this.account.related_account = {
				opening_balance: 0
			};
		} else {
			this.account.related_account = null;
		}
	}

	// List of accounts for the typeahead
	public accounts(filter: string, limit: number): angular.IPromise<Account[]> {
		return this.accountModel.all().then((accounts: Account[]): Account[] => this.limitToFilter(this.filterFilter(accounts, { name: filter, account_type: "asset" }), limit));
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;

		// Convert the account type & status to lower case
		this.account.account_type = this.account.account_type.toLowerCase() as StoredAccountType;
		this.account.status = this.account.status.toLowerCase() as StoredAccountStatus;

		this.accountModel.save(this.account).then((account: angular.IHttpResponse<Account>): void => this.$uibModalInstance.close(account.data), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

AccountEditController.$inject = ["$uibModalInstance", "filterFilter", "limitToFilter", "accountModel", "account"];
