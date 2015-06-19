{
	class AuthenticationEditView {
		constructor() {
			this.loginForm = element(by.css("form[name=loginForm]"));
			this.userNameInput = element(by.model("vm.userName"));
			this.passwordInput = element(by.model("vm.password"));
			this.errorMessage = element(by.exactBinding("vm.errorMessage"));
			this.cancelButton = element(by.buttonText("Cancel"));
			this.loginButton = element(by.buttonText("Login"));
		}

		// Login
		login(userName, password) {
			this.userNameInput.clear().click().sendKeys(userName);
			this.passwordInput.clear().click().sendKeys(password);
			this.loginButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}

		// Cancel
		cancel() {
			this.cancelButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}
	}

	module.exports = new AuthenticationEditView();
}
