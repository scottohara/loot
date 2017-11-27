class ScheduleEditView {
	constructor() {
		this.form = element(by.css("form[name=scheduleForm]"));
		this.primaryAccountTypeahead = element(by.model("vm.transaction.primary_account"));
		this.frequencyTypeahead = element(by.model("vm.schedule.frequency"));
		this.nextDueDateInput = element(by.model("vm.schedule.next_due_date"));
		this.payeeTypeahead = element(by.model("vm.transaction.payee"));
		this.securityTypeahead = element(by.model("vm.transaction.security"));
		this.amountInput = element(by.model("vm.transaction.amount"));
		this.categoryTypeahead = element(by.model("vm.transaction.category"));
		this.subcategoryTypeahead = element(by.model("vm.transaction.subcategory"));
		this.accountTypeahead = element(by.model("vm.transaction.account"));
		this.addSplitButton = element(by.partialButtonText("Add"));
		this.splitsTable = element.all(by.repeater("subtransaction in vm.transaction.subtransactions"));
		this.quantityInput = element(by.model("vm.transaction.quantity"));
		this.priceInput = element(by.model("vm.transaction.price"));
		this.commissionInput = element(by.model("vm.transaction.commission"));
		this.memoInput = element(by.model("vm.transaction.memo"));
		this.isEstimateCheckbox = element(by.model("vm.schedule.estimate"));
		this.autoEnteredCheckbox = element(by.model("vm.schedule.auto_enter"));
		this.errorMessage = element(by.binding("vm.errorMessage"));
		this.loadingLastTransactionMessage = element(by.cssContainingText("span.text-muted", "Finding last transaction for"));
		this.cancelButton = element(by.buttonText("Cancel"));
		this.saveButton = element(by.partialButtonText("Save"));
	}

	heading() {
		return this.form.element(by.css("h4")).getText();
	}

	isPresent() {
		// Need to artificially wait for 350ms because bootstrap modals have a fade transition
		browser.sleep(350);

		return this.form.isPresent();
	}

	enterScheduleDetails(details) {
		// Clear the values first
		this.clearScheduleDetails();

		// Primary account
		this.enterTypeaheadValue(this.primaryAccountTypeahead, details.primaryAccountName);

		// Frequency
		this.enterTypeaheadValue(this.frequencyTypeahead, details.frequency);

		// Next due date
		this.nextDueDateInput.click().sendKeys(details.nextDueDate);

		// Payee
		if (details.payeeName) {
			this.enterTypeaheadValue(this.payeeTypeahead, details.payeeName);
		}

		// Security
		if (details.securityName) {
			this.enterTypeaheadValue(this.securityTypeahead, details.securityName);
		}

		// Category
		this.enterTypeaheadValue(this.categoryTypeahead, details.categoryName);

		// Amount
		if (!details.quantity) {
			this.amountInput.click().sendKeys(details.amount);
		}

		// Subcategory
		if (details.subcategoryName) {
			this.enterTypeaheadValue(this.subcategoryTypeahead, details.subcategoryName);
		}

		// Account
		if (details.accountName) {
			this.enterTypeaheadValue(this.accountTypeahead, details.accountName);
		}

		// Splits
		if (details.subtransactions) {
			for (let i = 0; i < details.subtransactions.length; i++) {
				this.enterSplitDetails(i, details.subtransactions[i]);
			}

			this.removeUnusedSplits(details.subtransactions.length - 1);
		}

		// Quantity
		if (details.quantity) {
			this.quantityInput.click().sendKeys(details.quantity);
		}

		// Price
		if (details.price) {
			this.priceInput.click().sendKeys(details.price);
		}

		// Commission
		if (details.commission) {
			this.commissionInput.click().sendKeys(details.commission);
		}

		// Memo
		if (details.memo) {
			this.memoInput.click().sendKeys(details.memo);
		}

		// Estimate
		this.isEstimateCheckbox.isSelected().then(selected => {
			if (!selected && details.isEstimate) {
				browser.executeScript(isEstimateCheckbox => isEstimateCheckbox.scrollIntoView(), this.isEstimateCheckbox.getWebElement());
				this.isEstimateCheckbox.click();
			}
		});

		// Auto entered
		this.autoEnteredCheckbox.isSelected().then(selected => {
			if (!selected && details.isAutoEntered) {
				browser.executeScript(autoEnteredCheckbox => autoEnteredCheckbox.scrollIntoView(), this.autoEnteredCheckbox.getWebElement());
				this.autoEnteredCheckbox.click();
			}
		});
	}

	enterSplitDetails(index, details) {
		const row = this.splitsTable.get(index);

		// Add another split row if required
		this.splitsTable.count().then(count => {
			if (index > count - 1) {
				browser.executeScript(splitRow => splitRow.scrollIntoView(), row.getWebElement());
				this.addSplitButton.click();
			}
		});

		// Category
		this.enterTypeaheadValue(row.element(by.model("subtransaction.category")), details.categoryName);

		// Subcategory
		if (details.subcategoryName) {
			this.enterTypeaheadValue(row.element(by.model("subtransaction.subcategory")), details.subcategoryName);
		}

		// Account
		if (details.accountName) {
			this.enterTypeaheadValue(row.element(by.model("subtransaction.account")), details.accountName);
		}

		// Memo
		row.element(by.model("subtransaction.memo")).clear().click().sendKeys(details.memo);

		// Amount
		row.element(by.model("subtransaction.amount")).clear().click().sendKeys(details.rawAmount);
	}

	removeUnusedSplits(lastRowIndex) {
		this.splitsTable.count().then(count => {
			for (let splitCount = count - 1; splitCount > lastRowIndex; splitCount--) {
				this.splitsTable.get(splitCount).element(by.css("button")).click();
			}
		});
	}

	clearScheduleDetails() {
		// Primary account
		this.primaryAccountTypeahead.clear();

		// Frequency
		this.frequencyTypeahead.clear();

		// Next due date
		/*
		 * MISSING - can't clear date input (https://github.com/angular/protractor/issues/562)
		 * this.nextDueDateInput.clear();
		 */

		// Payee
		this.payeeTypeahead.clear();

		// Amount
		this.amountInput.clear();

		// Category
		this.categoryTypeahead.clear();

		// Memo
		this.memoInput.clear();
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

	enterTypeaheadValue(typeahead, value) {
		// Enter the value into the typeahead
		typeahead.click().sendKeys(value);

		// Wait for the typeahead $http promise to resolve
		browser.waitForAngular();

		// Send a TAB key to confirm the selection
		typeahead.sendKeys(protractor.Key.TAB);

		// Click the form to force any blur event handlers to run
		this.form.click();
	}
}

module.exports = new ScheduleEditView();