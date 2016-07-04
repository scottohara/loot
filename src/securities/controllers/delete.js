{
	/**
	 * Implementation
	 */
	class SecurityDeleteController {
		constructor($uibModalInstance, securityModel, security) {
			this.$uibModalInstance = $uibModalInstance;
			this.securityModel = securityModel;
			this.security = security;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteSecurity() {
			this.errorMessage = null;
			this.securityModel.destroy(this.security).then(() => this.$uibModalInstance.close(), error => (this.errorMessage = error.data));
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSecurities")
		.controller("SecurityDeleteController", SecurityDeleteController);

	/**
	 * Dependencies
	 */
	SecurityDeleteController.$inject = ["$uibModalInstance", "securityModel", "security"];
}
