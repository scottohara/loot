class SecurityEditView {
	constructor() {
		this.form = element(by.css("form[name=securityForm]"));
		this.securityNameInput = element(by.model("vm.security.name"));
		this.securityCodeInput = element(by.model("vm.security.code"));
		this.errorMessage = element(by.binding("vm.errorMessage"));
		this.cancelButton = element(by.buttonText("Cancel"));
		this.saveButton = element(by.partialButtonText("Save"));
	}

	heading() {
		return this.form.element(by.binding("::vm.mode")).getText();
	}

	isPresent() {
		// Need to artificially wait for 350ms because bootstrap modals have a fade transition
		browser.sleep(350);

		return this.form.isPresent();
	}

	enterSecurityDetails(details) {
		// Clear the values first
		this.clearSecurityDetails();

		// Security name
		this.securityNameInput.click().sendKeys(details.securityName);

		// Security code
		this.securityCodeInput.click().sendKeys(details.securityCode);
	}

	clearSecurityDetails() {
		// Security name
		this.securityNameInput.clear();

		// Security code
		this.securityCodeInput.clear();
	}

	cancel() {
		this.cancelButton.click();

		// Need to artificially wait for 350ms because bootstrap modals have a fade transition
		browser.sleep(350);
	}

	save() {
		this.saveButton.click();

		// Need to artificially wait for 350ms because bootstrap modals have a fade transition
		browser.sleep(350);
	}
}

module.exports = new SecurityEditView();