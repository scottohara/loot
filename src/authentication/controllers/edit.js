export default class AuthenticationEditController {
	constructor($uibModalInstance, authenticationModel) {
		this.$uibModalInstance = $uibModalInstance;
		this.authenticationModel = authenticationModel;
		this.userName = null;
		this.password = null;
		this.errorMessage = null;
		this.loginInProgress = false;
	}

	// Login and close the modal
	login() {
		this.errorMessage = null;
		this.loginInProgress = true;
		this.authenticationModel.login(this.userName, this.password).then(() => this.$uibModalInstance.close(), error => {
			this.errorMessage = error.data;
			this.loginInProgress = false;
		});
	}

	// Dismiss the modal without logging in
	cancel() {
		this.$uibModalInstance.dismiss();
	}
}

AuthenticationEditController.$inject = ["$uibModalInstance", "authenticationModel"];