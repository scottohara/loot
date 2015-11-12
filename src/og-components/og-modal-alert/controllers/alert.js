{
	/**
	 * Implementation
	 */
	class OgModalAlertController {
		constructor($modalInstance, alert) {
			this.$modalInstance = $modalInstance;
			this.alert = angular.extend({closeButtonStyle: "primary"}, alert);
		}

		// Close the modal
		closeModal() {
			this.$modalInstance.dismiss();
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
	OgModalAlertController.$inject = ["$modalInstance", "alert"];
}
