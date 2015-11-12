{
	/**
	 * Implementation
	 */
	class AuthenticationEditController {
		constructor($modalInstance, authenticationModel) {
			this.$modalInstance = $modalInstance;
			this.authenticationModel = authenticationModel;
			this.userName = null;
			this.password = null;
			this.errorMessage = null;
			this.loginInProgress = false;
		}

		/**
		 * Implementation
		 */

		// Login and close the modal
		login() {
			this.errorMessage = null;
			this.loginInProgress = true;
			this.authenticationModel.login(this.userName, this.password).then(() => this.$modalInstance.close(), error => {
				this.errorMessage = error.data;
				this.loginInProgress = false;
			});
		}

		// Dismiss the modal without logging in
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAuthentication")
		.controller("AuthenticationEditController", AuthenticationEditController);

	/**
	 * Dependencies
	 */
	AuthenticationEditController.$inject = ["$modalInstance", "authenticationModel"];
}
