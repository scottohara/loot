{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, confirm) {
			this.$modalInstance = $modalInstance;
			this.confirm = angular.extend({noButtonStyle: "default", yesButtonStyle: "primary"}, confirm);
		}

		// Yes response
		yes() {
			// Close the modal and return true
			this.$modalInstance.close(true);
		}

		// No response
		no() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgModalConfirmController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "confirm"];
}
