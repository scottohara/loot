(function() {
	"use strict";

	function SecurityEditView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=securityForm]"));
		view.heading = heading;
		view.securityNameInput = element(by.model("vm.security.name"));
		view.securityCodeInput = element(by.model("vm.security.code"));
		view.errorMessage = element(by.binding("vm.errorMessage"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.saveButton = element(by.partialButtonText("Save"));

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.enterSecurityDetails = enterSecurityDetails;
		view.clearSecurityDetails = clearSecurityDetails;
		view.cancel = cancel;
		view.save = save;

		function heading() {
			return view.form.element(by.binding("::vm.mode")).getText();
		}

		function isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return view.form.isPresent();
		}

		function enterSecurityDetails(details) {
			// Security name
			view.securityNameInput.sendKeys(details.securityName);

			// Security code
			view.securityCodeInput.sendKeys(details.securityCode);
		}

		function clearSecurityDetails() {
			// Security name
			view.securityNameInput.clear();

			// Security code
			view.securityCodeInput.clear();
		}

		function cancel() {
			view.cancelButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}

		function save() {
			view.saveButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}
	}

	module.exports = new SecurityEditView();
})();
