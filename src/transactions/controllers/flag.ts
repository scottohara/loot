import {
	Transaction,
	TransactionFlag
} from "transactions/types";
import { IModalInstanceService } from "angular-ui-bootstrap";
import TransactionModel from "transactions/models/transaction";

export default class TransactionFlagController {
	public errorMessage: string | null = null;

	public flag: TransactionFlag;

	public readonly flagged: boolean;

	public constructor(private readonly $uibModalInstance: IModalInstanceService,
						private readonly transactionModel: TransactionModel,
						private readonly transaction: Transaction) {
		this.flag = "(no memo)" === String(transaction.flag) ? null : transaction.flag;
		this.flagged = Boolean(transaction.flag);
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;
		this.transaction.flag = (this.flag && this.flag) || "(no memo)";
		this.transactionModel.flag(this.transaction).then((): void => this.$uibModalInstance.close(this.transaction), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Delete and close the modal
	public deleteFlag(): void {
		this.errorMessage = null;
		this.transactionModel.unflag(Number(this.transaction.id)).then((): void => {
			this.transaction.flag = null;
			this.$uibModalInstance.close(this.transaction);
		}, (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

TransactionFlagController.$inject = ["$uibModalInstance", "transactionModel", "transaction"];