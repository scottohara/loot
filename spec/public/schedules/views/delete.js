(function() {
	"use strict";

	function ScheduleDeleteView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=scheduleForm]"));
		view.heading = heading;
		view.subcategoryAlert = element(by.cssContainingText("div.alert", "All subcategories will also be deleted"));
		view.categoryName = categoryName;
		view.categoryParent = categoryParent;
		view.direction = direction;
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
			return view.form.element(by.cssContainingText("h4", "Delete Schedule?")).getText();
		}

		function categoryName() {
			return element(by.binding("::vm.category.name")).getText();
		}

		function categoryParent() {
			return element(by.binding("::vm.category.parent.name")).getText();
		}

		function direction() {
			return element(by.binding("::vm.category.direction")).getText();
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

	module.exports = new ScheduleDeleteView();
})();
