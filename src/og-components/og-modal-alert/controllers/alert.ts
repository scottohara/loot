import {IModalInstanceService} from "angular-ui-bootstrap";
import {OgModalAlert} from "og-components/og-modal-alert/types";
import angular from "angular";

export default class OgModalAlertController {
	public readonly alert: OgModalAlert;

	public constructor(private readonly $uibModalInstance: IModalInstanceService, alert: OgModalAlert) {
		this.alert = angular.extend({closeButtonStyle: "primary"}, alert);
	}

	// Close the modal
	public closeModal(): void {
		this.$uibModalInstance.dismiss();
	}
}

OgModalAlertController.$inject = ["$uibModalInstance", "alert"];