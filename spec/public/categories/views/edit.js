(function() {
	"use strict";

	function CategoryEditView() {
		var view = this;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=categoryForm]"));
		view.heading = heading;
		view.categoryNameInput = element(by.model("vm.category.name"));
		view.categoryParentTypeahead = element(by.model("vm.category.parent"));
		view.directionRadioButton = directionRadioButton;
		view.errorMessage = element(by.binding("vm.errorMessage"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.saveButton = element(by.partialButtonText("Save"));

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.enterCategoryDetails = enterCategoryDetails;
		view.clearCategoryDetails = clearCategoryDetails;
		view.cancel = cancel;
		view.save = save;

		function heading() {
			return view.form.element(by.binding("::vm.mode")).getText();
		}

		function directionRadioButton(direction, isActive) {
			var selector = "label" + (isActive ? ".active" : "") + "[name=direction]",
					buttonText = "inflow" === direction ? "Income" : "Expense";

			return element(by.cssContainingText(selector, buttonText));
		}

		function isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return view.form.isPresent();
		}

		function enterCategoryDetails(details) {
			// Category name
			view.categoryNameInput.sendKeys(details.categoryName);

			// Parent
			if (details.categoryParent) {
				view.categoryParentTypeahead.sendKeys(details.categoryParent);

				// Wait for the typeahead $http promise to resolve
				browser.waitForAngular();

				// Send a TAB key to confirm the selection
				view.categoryParentTypeahead.sendKeys(protractor.Key.TAB);

				// Click the form to force any blur event handlers to run
				view.form.click();
			}

			// Direction
			if (!details.categoryParent && details.direction) {
				view.directionRadioButton(details.direction).click();
			}
		}

		function clearCategoryDetails() {
			// Category name
			view.categoryNameInput.clear();
		}

		function cancel() {
			view.cancelButton.click();
		}

		function save() {
			view.saveButton.click();
		}
	}

	module.exports = new CategoryEditView();
})();
