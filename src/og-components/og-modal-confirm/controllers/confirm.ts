import { OgModalConfirm } from "og-components/og-modal-confirm/types";
import angular from "angular";

export default class OgModalConfirmController {
	public readonly confirm: OgModalConfirm;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService, confirm: OgModalConfirm) {
		this.confirm = angular.extend({ noButtonStyle: "default", yesButtonStyle: "primary" }, confirm);
	}

	// Yes response
	public yes(): void {
		// Close the modal and return true
		this.$uibModalInstance.close(true);
	}

	// No response
	public no(): void {
		this.$uibModalInstance.dismiss();
	}
}

OgModalConfirmController.$inject = ["$uibModalInstance", "confirm"];