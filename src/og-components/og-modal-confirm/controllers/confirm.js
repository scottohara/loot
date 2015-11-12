{
	/**
	 * Implementation
	 */
	class OgModalConfirmController {
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
		.controller("OgModalConfirmController", OgModalConfirmController);

	/**
	 * Dependencies
	 */
	OgModalConfirmController.$inject = ["$modalInstance", "confirm"];
}
