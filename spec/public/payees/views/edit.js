(function() {
	"use strict";

	function PayeeEditView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=payeeForm]"));
		view.heading = heading;
		view.payeeNameInput = element(by.model("vm.payee.name"));
		view.errorMessage = element(by.binding("vm.errorMessage"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.saveButton = element(by.partialButtonText("Save"));

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.enterPayeeDetails = enterPayeeDetails;
		view.clearPayeeDetails = clearPayeeDetails;
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

		function enterPayeeDetails(details) {
			// Payee name
			view.payeeNameInput.sendKeys(details.payeeName);
		}

		function clearPayeeDetails() {
			// Payee name
			view.payeeNameInput.clear();
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

	module.exports = new PayeeEditView();
})();
