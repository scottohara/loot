{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, securityModel, security) {
			this.$modalInstance = $modalInstance;
			this.securityModel = securityModel;
			this.security = security;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteSecurity() {
			this.errorMessage = null;
			this.securityModel.destroy(this.security).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSecurities")
		.controller("SecurityDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "securityModel", "security"];
}
