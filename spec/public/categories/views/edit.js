{
	class CategoryEditView {
		constructor() {
			this.form = element(by.css("form[name=categoryForm]"));
			this.categoryNameInput = element(by.model("vm.category.name"));
			this.categoryParentTypeahead = element(by.model("vm.category.parent"));
			this.errorMessage = element(by.binding("vm.errorMessage"));
			this.cancelButton = element(by.buttonText("Cancel"));
			this.saveButton = element(by.partialButtonText("Save"));
		}

		heading() {
			return this.form.element(by.binding("::vm.mode")).getText();
		}

		directionRadioButton(direction, isActive) {
			const selector = `label${isActive ? ".active" : ""}[name=direction]`,
						buttonText = "inflow" === direction ? "Income" : "Expense";

			return element(by.cssContainingText(selector, buttonText));
		}

		isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return this.form.isPresent();
		}

		enterCategoryDetails(details) {
			// Clear the values first
			this.clearCategoryDetails();

			// Category name
			this.categoryNameInput.click().sendKeys(details.categoryName);

			// Parent
			if (details.categoryParent) {
				this.categoryParentTypeahead.click().sendKeys(details.categoryParent);

				// Wait for the typeahead $http promise to resolve
				browser.waitForAngular();

				// Send a TAB key to confirm the selection
				this.categoryParentTypeahead.sendKeys(protractor.Key.TAB);

				// Click the form to force any blur event handlers to run
				this.form.click();
			}

			// Direction
			if (!details.categoryParent && details.direction) {
				this.directionRadioButton(details.direction).click();
			}
		}

		clearCategoryDetails() {
			// Category name
			this.categoryNameInput.clear();
		}

		cancel() {
			this.cancelButton.click();
		}

		save() {
			this.saveButton.click();
		}
	}

	module.exports = new CategoryEditView();
}
