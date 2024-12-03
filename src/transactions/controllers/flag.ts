import type {
	Transaction,
	TransactionFlag,
	TransactionFlagType,
} from "~/transactions/types";
import type TransactionModel from "~/transactions/models/transaction";

export default class TransactionFlagController {
	public errorMessage: string | null = null;

	public flagType: TransactionFlagType;

	public flag: TransactionFlag;

	public readonly flagged: boolean;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly transactionModel: TransactionModel,
		private readonly transaction: Transaction,
	) {
		this.flagType = transaction.flag_type ?? "followup";
		this.flag =
			"(no memo)" === String(transaction.flag) ? "" : (transaction.flag ?? "");
		this.flagged = Boolean(transaction.flag);
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;
		this.transaction.flag_type = this.flagType;
		this.transaction.flag = "" === this.flag ? "(no memo)" : this.flag;
		this.transactionModel.flag(this.transaction).then(
			(): void => this.$uibModalInstance.close(this.transaction),
			(error: unknown): string =>
				(this.errorMessage = (error as angular.IHttpResponse<string>).data),
		);
	}

	// Delete and close the modal
	public deleteFlag(): void {
		this.errorMessage = null;
		this.transactionModel.unflag(Number(this.transaction.id)).then(
			(): void => {
				this.transaction.flag_type = null;
				this.transaction.flag = null;
				this.$uibModalInstance.close(this.transaction);
			},
			(error: unknown): string =>
				(this.errorMessage = (error as angular.IHttpResponse<string>).data),
		);
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

TransactionFlagController.$inject = [
	"$uibModalInstance",
	"transactionModel",
	"transaction",
];
