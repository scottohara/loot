import type { Transaction } from "~/transactions/types";
import type TransactionModel from "~/transactions/models/transaction";

export default class TransactionDeleteController {
	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly transactionModel: TransactionModel,
		private readonly transaction: Transaction,
	) {}

	// Delete and close the modal
	public deleteTransaction(): void {
		this.errorMessage = null;
		this.transactionModel.destroy(this.transaction).then(
			(): void => this.$uibModalInstance.close(),
			(error: unknown): string =>
				(this.errorMessage = (error as angular.IHttpResponse<string>).data),
		);
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

TransactionDeleteController.$inject = [
	"$uibModalInstance",
	"transactionModel",
	"transaction",
];
