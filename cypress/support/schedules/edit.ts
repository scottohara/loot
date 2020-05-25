import { ScheduleEdit } from "./types";
import { Subtransaction } from "../transactions/types";

export const scheduleEditForm = "form[name=scheduleForm]";
export const scheduleEditHeading = `${scheduleEditForm} > div.modal-header > h4`;

const primaryAccountTypeahead = `${scheduleEditForm} input[name=primaryAccount]`,
			frequencyTypeahead = `${scheduleEditForm} input[name=frequency]`,
			nextDueDateInput = `${scheduleEditForm} #transactionDate`,
			payeeTypeahead = `${scheduleEditForm} input[name=payee]`,
			securityTypeahead = `${scheduleEditForm} input[name=security]`,
			categoryTypeahead = `${scheduleEditForm} #category`,
			amountInput = `${scheduleEditForm} #amount`,
			subcategoryTypeahead = `${scheduleEditForm} #subcategory`,
			accountTypeahead = `${scheduleEditForm} #account`,
			subtransactionsTable = `${scheduleEditForm} > div.modal-body > div > table`,
			subtransactionsTableRows = `${subtransactionsTable} > tbody > tr`,
			subtransactionCategoryTypeahead = "input[name=category]",
			subtransactionSubcategoryOrAccountTypeahead = "ng-form[name=accountForm] input",
			subtransactionMemoInput = "td:nth(2) input",
			subtransactionAmountInput = "input[name=amount]",
			subtransactionDeleteButtons = `${subtransactionsTableRows} > td > button`,
			subtransactionAddButton = `${subtransactionsTable} > tfoot > tr:first > td:first > button`,
			quantityInput = `${scheduleEditForm} #quantity`,
			priceInput = `${scheduleEditForm} #price`,
			commissionInput = `${scheduleEditForm} #commission`,
			memoInput = `${scheduleEditForm} #memo`,
			estimateCheckbox = `${scheduleEditForm} input[type=checkbox]:first`,
			autoEnteredCheckbox = `${scheduleEditForm} input[type=checkbox]:nth(1)`;

export const cancelButton = `${scheduleEditForm} div.modal-footer > button[type=button]`;
export const saveButton = `${scheduleEditForm} > div.modal-footer > button[type=submit]`;

function populateSubtransactionWith(subtransaction: Subtransaction, index: number): void {
	const {
		categoryName,
		subcategoryOrAccountName,
		memo,
		rawAmount
	} = subtransaction;

	// Click the add button
	cy.get(subtransactionAddButton).click();

	cy.get(subtransactionsTableRows).eq(index).within((): void => {
		cy.typeahead(subtransactionCategoryTypeahead, categoryName);
		cy.typeahead(subtransactionSubcategoryOrAccountTypeahead, subcategoryOrAccountName);
		cy.get(subtransactionMemoInput).clear().type(memo);
		cy.get(subtransactionAmountInput).clear().type(String(rawAmount));
	});
}

export function populateFormWith(schedule: ScheduleEdit): void {
	const {
		primaryAccountName,
		frequency,
		rawNextDueDate,
		payeeName,
		securityName,
		amount,
		categoryName,
		subcategoryName,
		accountName,
		subtransactions,
		quantity,
		price,
		commission,
		memoFromInvestmentDetails,
		memo,
		isEstimate,
		isAutoEntered
	} = schedule;

	cy.typeahead(primaryAccountTypeahead, primaryAccountName);
	cy.typeahead(frequencyTypeahead, frequency);
	cy.get(nextDueDateInput).clear().type(String(rawNextDueDate));

	if (undefined !== payeeName) {
		cy.typeahead(payeeTypeahead, payeeName);
	}

	if (undefined !== securityName) {
		cy.typeahead(securityTypeahead, securityName);
	}

	// Wait for last transaction details to finish auto-populating
	cy.get(memoInput).click();
	cy.contains("Finding last transaction for ").should("not.be.visible");

	cy.typeahead(categoryTypeahead, categoryName);

	if (undefined !== amount) {
		cy.get(amountInput).clear().type(amount);
	}

	if (undefined !== subcategoryName) {
		cy.typeahead(subcategoryTypeahead, subcategoryName);
	}

	if (undefined !== accountName) {
		cy.typeahead(accountTypeahead, accountName);
	}

	if (undefined !== subtransactions) {
		// Remove any existing subtransaction rows
		cy.get(subtransactionDeleteButtons).each((button: HTMLButtonElement): void => button.click());

		subtransactions.forEach(populateSubtransactionWith);
	}

	if (undefined !== quantity) {
		cy.get(quantityInput).clear().type(quantity);
	}

	if (undefined !== price) {
		cy.get(priceInput).clear().type(price);
	}

	if (undefined !== commission) {
		cy.get(commissionInput).clear().type(commission);
	}

	if (true !== memoFromInvestmentDetails) {
		cy.get(memoInput).clear().type(memo);
	}

	if (true === isEstimate) {
		cy.get(estimateCheckbox).check();
	}

	if (true === isAutoEntered) {
		cy.get(autoEnteredCheckbox).check();
	}
}

export function invalidateForm(): void {
	cy.get(primaryAccountTypeahead).clear();
}