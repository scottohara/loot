class PayeeEditView {
	constructor() {
		this.form = element(by.css("form[name=payeeForm]"));
		this.payeeNameInput = element(by.model("vm.payee.name"));
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

	enterPayeeDetails(details) {
		// Clear the values first
		this.clearPayeeDetails();

		// Payee name
		this.payeeNameInput.click().sendKeys(details.payeeName);
	}

	clearPayeeDetails() {
		// Payee name
		this.payeeNameInput.clear();
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

module.exports = new PayeeEditView();