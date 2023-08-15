import type AuthenticationModel from "~/authentication/models/authentication";

export default class AuthenticationEditController {
	public userName: string | null = null;

	public password: string | null = null;

	public errorMessage: string | null = null;

	public loginInProgress = false;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly authenticationModel: AuthenticationModel) {}

	// Login and close the modal
	public login(): void {
		this.errorMessage = null;
		this.loginInProgress = true;
		this.authenticationModel.login(this.userName, this.password).then((): void => this.$uibModalInstance.close(), (error: angular.IHttpResponse<string>): void => {
			this.errorMessage = error.data;
			this.loginInProgress = false;
		});
	}

	// Dismiss the modal without logging in
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

AuthenticationEditController.$inject = ["$uibModalInstance", "authenticationModel"];