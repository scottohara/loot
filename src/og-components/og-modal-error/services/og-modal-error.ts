import { IModalService } from "angular-ui-bootstrap";
import { OgModalAlert } from "og-components/og-modal-alert/types";
import OgModalAlertView from "og-components/og-modal-alert/views/alert.html";

export default class OgModalErrorService {
	public constructor(private readonly $uibModal: IModalService) {}

	public showError(message?: string): void {
		if (undefined !== message && "escape key press" !== message) {
			this.$uibModal.open({
				templateUrl: OgModalAlertView,
				controller: "OgModalAlertController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					alert: (): OgModalAlert => ({
						header: "An error has occurred",
						message
					})
				}
			}).result.catch(undefined);
		}
	}
}

OgModalErrorService.$inject = ["$uibModal"];