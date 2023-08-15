import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import angular from "angular";

export default class SecurityEditController {
	public readonly security: Security;

	public readonly mode: "Add" | "Edit";

	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly securityModel: SecurityModel,
						security: Security | undefined) {
		this.security = angular.extend({}, security) as Security;
		this.mode = undefined === security ? "Add" : "Edit";
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;
		this.securityModel.save(this.security).then((security: angular.IHttpResponse<Security>): void => this.$uibModalInstance.close(security.data), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

SecurityEditController.$inject = ["$uibModalInstance", "securityModel", "security"];