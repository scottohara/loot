(function() {
	"use strict";

	function AuthenticationEditView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.loginForm = element(by.css("form[name=loginForm]"));
		view.userNameInput = element(by.model("vm.userName"));
		view.passwordInput = element(by.model("vm.password"));
		view.errorMessage = element(by.exactBinding("vm.errorMessage"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.loginButton = element(by.buttonText("Login"));

		/**
		 * Behaviours
		 */
		view.login = login;
		view.cancel = cancel;

		// Login
		function login(userName, password) {
			view.userNameInput.sendKeys(userName);
			view.passwordInput.sendKeys(password);
			view.loginButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}

		// Cancel
		function cancel() {
			view.cancelButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}
	}

	module.exports = new AuthenticationEditView();
})();
