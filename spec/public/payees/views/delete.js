(function() {
	"use strict";

	function PayeeDeleteView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=payeeForm]"));
		view.heading = heading;
		view.payeeName = payeeName;
		view.errorMessage = element(by.binding("vm.errorMessage"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.deleteButton = element(by.partialButtonText("Delete"));

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.cancel = cancel;
		view.del = del;

		function heading() {
			return view.form.element(by.cssContainingText("h4", "Delete Payee?")).getText();
		}

		function payeeName() {
			return element(by.binding("::vm.payee.name")).getText();
		}

		function isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return view.form.isPresent();
		}

		function cancel() {
			view.cancelButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}

		function del() {
			view.deleteButton.click();

			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);
		}
	}

	module.exports = new PayeeDeleteView();
})();
