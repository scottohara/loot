{
	/**
	 * Implementation
	 */
	class Controller {
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
		.controller("OgModalAlertController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "alert"];
}
