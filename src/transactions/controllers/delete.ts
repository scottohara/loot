import type { Transaction } from "transactions/types";
import type TransactionModel from "transactions/models/transaction";

export default class TransactionDeleteController {
	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly transactionModel: TransactionModel,
						private readonly transaction: Transaction) {}

	// Delete and close the modal
	public deleteTransaction(): void {
		this.errorMessage = null;
		this.transactionModel.destroy(this.transaction).then((): void => this.$uibModalInstance.close(), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

TransactionDeleteController.$inject = ["$uibModalInstance", "transactionModel", "transaction"];