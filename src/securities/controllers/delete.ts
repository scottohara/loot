import {IModalInstanceService} from "angular-ui-bootstrap";
import {Security} from "securities/types";
import SecurityModel from "securities/models/security";

export default class SecurityDeleteController {
	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: IModalInstanceService,
											private readonly securityModel: SecurityModel,
											public readonly security: Security) {}

	// Delete and close the modal
	public deleteSecurity(): void {
		this.errorMessage = null;
		this.securityModel.destroy(this.security).then((): void => this.$uibModalInstance.close(), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

SecurityDeleteController.$inject = ["$uibModalInstance", "securityModel", "security"];