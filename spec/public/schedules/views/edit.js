(function() {
	"use strict";

	function ScheduleEditView() {
		var view = this,
				space = protractor.Key.SPACE;

		/**
		 * UI elements
		 */
		view.form = element(by.css("form[name=scheduleForm]"));
		view.heading = heading;
		view.primaryAccountTypeahead = element(by.model("vm.transaction.primary_account"));
		view.frequencyTypeahead = element(by.model("vm.schedule.frequency"));
		view.nextDueDateInput = element(by.model("vm.schedule.next_due_date"));
		view.payeeTypeahead = element(by.model("vm.transaction.payee"));
		view.securityTypeahead = element(by.model("vm.transaction.security"));
		view.amountInput = element(by.model("vm.transaction.amount"));
		view.categoryTypeahead = element(by.model("vm.transaction.category"));
		view.subcategoryTypeahead = element(by.model("vm.transaction.subcategory"));
		view.accountTypeahead = element(by.model("vm.transaction.account"));
		view.addSplitButton = element(by.partialButtonText("Add"));
		view.splitsTable = element.all(by.repeater("subtransaction in vm.transaction.subtransactions"));
		view.quantityInput = element(by.model("vm.transaction.quantity"));
		view.priceInput = element(by.model("vm.transaction.price"));
		view.commissionInput = element(by.model("vm.transaction.commission"));
		view.memoInput = element(by.model("vm.transaction.memo"));
		view.isEstimateCheckbox = element(by.model("vm.schedule.estimate"));
		view.autoEnteredCheckbox = element(by.model("vm.schedule.auto_enter"));
		view.errorMessage = element(by.binding("vm.errorMessage"));
		view.loadingLastTransactionMessage = element(by.cssContainingText("span.text-muted", "Finding last transaction for"));
		view.cancelButton = element(by.buttonText("Cancel"));
		view.saveButton = element(by.partialButtonText("Save"));

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.enterScheduleDetails = enterScheduleDetails;
		view.enterSplitDetails = enterSplitDetails;
		view.removeUnusedSplits = removeUnusedSplits;
		view.clearScheduleDetails = clearScheduleDetails;
		view.cancel = cancel;
		view.save = save;

		function heading() {
			return view.form.element(by.css("h4")).getText();
		}

		function isPresent() {
			// Need to artificially wait for 350ms because bootstrap modals have a fade transition
			browser.sleep(350);

			return view.form.isPresent();
		}

		function enterScheduleDetails(details) {
			// Primary account
			enterTypeaheadValue(view.primaryAccountTypeahead, details.primaryAccountName);

			// Frequency
			enterTypeaheadValue(view.frequencyTypeahead, details.frequency);

			// Next due date
			view.nextDueDateInput.sendKeys(details.nextDueDate);

			// Payee
			if (details.payeeName) {
				enterTypeaheadValue(view.payeeTypeahead, details.payeeName, true);
			}

			// Security
			if (details.securityName) {
				enterTypeaheadValue(view.securityTypeahead, details.securityName, true);
			}

			// Category
			enterTypeaheadValue(view.categoryTypeahead, details.categoryName);

			// Amount
			if (!details.quantity) {
				view.amountInput.sendKeys(details.amount);
			}

			// Subcategory
			if (details.subcategoryName) {
				enterTypeaheadValue(view.subcategoryTypeahead, details.subcategoryName, true);
			}
			
			// Account
			if (details.accountName) {
				enterTypeaheadValue(view.accountTypeahead, details.accountName);
			}

			// Splits
			if (details.subtransactions) {
				for (var i = 0; i < details.subtransactions.length; i++) {
					view.enterSplitDetails(i, details.subtransactions[i]);
				}

				view.removeUnusedSplits(details.subtransactions.length - 1);
			}

			// Quantity
			if (details.quantity) {
				view.quantityInput.sendKeys(details.quantity);
			}

			// Price
			if (details.price) {
				view.priceInput.sendKeys(details.price);
			}

			// Commission
			if (details.commission) {
				view.commissionInput.sendKeys(details.commission);
			}

			// Memo
			if (details.memo) {
				view.memoInput.sendKeys(details.memo);
			}

			// Estimate
			view.isEstimateCheckbox.isSelected().then(function(selected) {
				if (!selected && details.isEstimate) {
					browser.executeScript(function(isEstimateCheckbox) {
						isEstimateCheckbox.scrollIntoView();
					}, view.isEstimateCheckbox.getWebElement());

					view.isEstimateCheckbox.click();
				}
			});

			// Auto entered
			view.autoEnteredCheckbox.isSelected().then(function(selected) {
				if (!selected && details.isAutoEntered) {
					browser.executeScript(function(autoEnteredCheckbox) {
						autoEnteredCheckbox.scrollIntoView();
					}, view.autoEnteredCheckbox.getWebElement());

					view.autoEnteredCheckbox.click();
				}
			});
		}

		function enterSplitDetails(index, details) {
			var row = view.splitsTable.get(index);

			// Add another split row if required
			view.splitsTable.count().then(function(count) {
				if (index > (count - 1)) {
					browser.executeScript(function(row) {
						row.scrollIntoView();
					}, row.getWebElement());

					view.addSplitButton.click();
				}
			});

			// Category
			enterTypeaheadValue(row.element(by.model("subtransaction.category")), details.categoryName, true);

			// Subcategory
			if (details.subcategoryName) {
				enterTypeaheadValue(row.element(by.model("subtransaction.subcategory")), details.subcategoryName, true);
			}

			// Account
			if (details.accountName) {
				enterTypeaheadValue(row.element(by.model("subtransaction.account")), details.accountName);
			}

			// Memo
			row.element(by.model("subtransaction.memo")).sendKeys(details.memo);

			// Amount
			row.element(by.model("subtransaction.amount")).sendKeys(details.rawAmount);
		}

		function removeUnusedSplits(lastRowIndex) {
			view.splitsTable.count().then(function(count) {
				for (count--; count > lastRowIndex; count--) {
					view.splitsTable.get(count).element(by.css("button")).click();
				}
			});
		}

		function clearScheduleDetails() {
			// Primary account
			view.primaryAccountTypeahead.clear();

			// Frequency
			view.frequencyTypeahead.clear();

			// Next due date
			// TODO - can't clear date input (https://github.com/angular/protractor/issues/562)
			// view.nextDueDateInput.clear();

			// Payee
			view.payeeTypeahead.clear();

			// Amount
			view.amountInput.clear();

			// Category
			view.categoryTypeahead.clear();

			// Memo
			view.memoInput.clear();
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

		function enterTypeaheadValue(typeahead, value, isEditable) {
			// If the typeahead is not editable, need to take a character from the start of the string (https://github.com/scottohara/loot/issues/98)
			value = isEditable ? value : value.substr(1);

			// Enter the value into the typeahead
			typeahead.sendKeys(value);

			// Wait for the typeahead $http promise to resolve
			browser.waitForAngular();

			// Send a TAB key to confirm the selection
			typeahead.sendKeys(protractor.Key.TAB);

			// Click the form to force any blur event handlers to run
			view.form.click();
		}
	}

	module.exports = new ScheduleEditView();
})();
