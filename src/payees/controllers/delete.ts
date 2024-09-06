import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";

export default class PayeeDeleteController {
	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly payeeModel: PayeeModel,
		public readonly payee: Payee,
	) {}

	// Delete and close the modal
	public deletePayee(): void {
		this.errorMessage = null;
		this.payeeModel.destroy(this.payee).then(
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

PayeeDeleteController.$inject = ["$uibModalInstance", "payeeModel", "payee"];
