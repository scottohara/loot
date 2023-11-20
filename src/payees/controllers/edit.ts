import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";
import angular from "angular";

export default class PayeeEditController {
	public readonly payee: Payee;

	public readonly mode: "Add" | "Edit";

	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly payeeModel: PayeeModel,
		payee: Payee | undefined,
	) {
		this.payee = angular.extend({}, payee) as Payee;
		this.mode = undefined === payee ? "Add" : "Edit";
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;
		this.payeeModel.save(this.payee).then(
			(payee: angular.IHttpResponse<Payee>): void =>
				this.$uibModalInstance.close(payee.data),
			(error: angular.IHttpResponse<string>): string =>
				(this.errorMessage = error.data),
		);
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

PayeeEditController.$inject = ["$uibModalInstance", "payeeModel", "payee"];
