import {IModalInstanceService} from "angular-ui-bootstrap";
import {Security} from "securities/types";
import SecurityModel from "securities/models/security";
import angular from "angular";

export default class SecurityEditController {
	public readonly security: Security;

	public readonly mode: "Edit" | "Add";

	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: IModalInstanceService,
											private readonly securityModel: SecurityModel, security: Security) {
		this.security = angular.extend({}, security);
		this.mode = security ? "Edit" : "Add";
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