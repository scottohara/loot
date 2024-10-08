import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";

export default class SecurityDeleteController {
	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly securityModel: SecurityModel,
		public readonly security: Security,
	) {}

	// Delete and close the modal
	public deleteSecurity(): void {
		this.errorMessage = null;
		this.securityModel.destroy(this.security).then(
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

SecurityDeleteController.$inject = [
	"$uibModalInstance",
	"securityModel",
	"security",
];
