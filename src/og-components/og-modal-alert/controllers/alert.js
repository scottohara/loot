import angular from "angular";

export default class OgModalAlertController {
	constructor($uibModalInstance, alert) {
		this.$uibModalInstance = $uibModalInstance;
		this.alert = angular.extend({closeButtonStyle: "primary"}, alert);
	}

	// Close the modal
	closeModal() {
		this.$uibModalInstance.dismiss();
	}
}

OgModalAlertController.$inject = ["$uibModalInstance", "alert"];