{
	class SecurityDeleteView {
		constructor() {
			this.form = element(by.css("form[name=securityForm]"));
			this.errorMessage = element(by.binding("vm.errorMessage"));
			this.cancelButton = element(by.buttonText("Cancel"));
			this.deleteButton = element(by.partialButtonText("Delete"));
		}

		heading() {
			return this.form.element(by.cssContainingText("h4", "Delete Security?")).getText();
		}

		securityName() {
			return element(by.binding("::vm.security.name")).getText();
		}

		securityCode() {
			return element(by.binding("::vm.security.code")).getText();
		}

		isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return this.form.isPresent();
		}

		cancel() {
			this.cancelButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}

		del() {
			this.deleteButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}
	}

	module.exports = new SecurityDeleteView();
}
