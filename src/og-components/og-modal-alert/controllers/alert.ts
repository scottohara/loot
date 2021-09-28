import type { OgModalAlert } from "og-components/og-modal-alert/types";
import angular from "angular";

export default class OgModalAlertController {
	public readonly alert: OgModalAlert;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService, alert: OgModalAlert) {
		this.alert = angular.extend({ closeButtonStyle: "primary" }, alert) as OgModalAlert;
	}

	// Close the modal
	public closeModal(): void {
		this.$uibModalInstance.dismiss();
	}
}

OgModalAlertController.$inject = ["$uibModalInstance", "alert"];