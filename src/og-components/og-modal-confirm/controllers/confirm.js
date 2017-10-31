import angular from "angular";

export default class OgModalConfirmController {
	constructor($uibModalInstance, confirm) {
		this.$uibModalInstance = $uibModalInstance;
		this.confirm = angular.extend({noButtonStyle: "default", yesButtonStyle: "primary"}, confirm);
	}

	// Yes response
	yes() {
		// Close the modal and return true
		this.$uibModalInstance.close(true);
	}

	// No response
	no() {
		this.$uibModalInstance.dismiss();
	}
}

OgModalConfirmController.$inject = ["$uibModalInstance", "confirm"];