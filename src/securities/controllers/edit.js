{
	/**
	 * Implementation
	 */
	class SecurityEditController {
		constructor($uibModalInstance, securityModel, security) {
			this.$uibModalInstance = $uibModalInstance;
			this.securityModel = securityModel;
			this.security = angular.extend({}, security);
			this.mode = security ? "Edit" : "Add";
			this.errorMessage = null;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.securityModel.save(this.security).then(security => this.$uibModalInstance.close(security.data), error => (this.errorMessage = error.data));
		}

		// Dismiss the modal without saving
		cancel() {
			this.$uibModalInstance.dismiss();
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
	SecurityEditController.$inject = ["$uibModalInstance", "securityModel", "security"];
}
