{
	/**
	 * Implementation
	 */
	class OgModalAlertController {
		constructor($uibModalInstance, alert) {
			this.$uibModalInstance = $uibModalInstance;
			this.alert = angular.extend({closeButtonStyle: "primary"}, alert);
		}

		// Close the modal
		closeModal() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgModalAlertController", OgModalAlertController);

	/**
	 * Dependencies
	 */
	OgModalAlertController.$inject = ["$uibModalInstance", "alert"];
}
