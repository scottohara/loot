{
	/**
	 * Implementation
	 */
	class SecurityEditController {
		constructor($modalInstance, securityModel, security) {
			this.$modalInstance = $modalInstance;
			this.securityModel = securityModel;
			this.security = angular.extend({}, security);
			this.mode = security ? "Edit" : "Add";
			this.errorMessage = null;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.securityModel.save(this.security).then(security => this.$modalInstance.close(security.data), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSecurities")
		.controller("SecurityEditController", SecurityEditController);

	/**
	 * Dependencies
	 */
	SecurityEditController.$inject = ["$modalInstance", "securityModel", "security"];
}
