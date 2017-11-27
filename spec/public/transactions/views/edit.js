class TransactionEditView {
	constructor() {
		this.form = element(by.css("form[name=transactionForm]"));
		this.transactionDateInput = element(by.model("vm.transaction.transaction_date"));
		this.primaryAccountTypeahead = element(by.model("vm.transaction.primary_account"));
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

	enterTransactionDetails(contextType, details) {
		// Clear the values first
		this.clearTransactionDetails(contextType);

		// Transaction date
		this.transactionDateInput.click().sendKeys(details.transactionDate);

		// Primary account
		if (details.primaryAccountName) {
			this.enterTypeaheadValue(this.primaryAccountTypeahead, details.primaryAccountName);
		}

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
			this.amountInput.clear().click().sendKeys(details.amount);
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

	clearTransactionDetails(contextType) {
		// Primary account
		if ("account" !== contextType) {
			this.primaryAccountTypeahead.clear();
		}

		// Transaction date
		/*
		 * MISSING - can't clear date input (https://github.com/angular/protractor/issues/562)
		 * this.transactionDateInput.clear();
		 */

		// Payee
		this.payeeTypeahead.isPresent().then(isPresent => {
			if (isPresent && "payee" !== contextType) {
				this.payeeTypeahead.clear();
			}
		});

		// Amount
		this.amountInput.isPresent().then(isPresent => {
			if (isPresent) {
				this.amountInput.clear();
			}
		});

		// Category
		if ("category" !== contextType) {
			this.categoryTypeahead.clear();
		}

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

module.exports = new TransactionEditView();