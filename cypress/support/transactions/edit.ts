import type {
	Subtransaction,
	TransactionEdit,
} from "~/support/transactions/types";

export const transactionEditForm = "form[name=transactionForm]";
export const transactionEditHeading = `${transactionEditForm} > div.modal-header > h4`;

const transactionDateInput = `${transactionEditForm} #transactionDate`,
	payeeTypeahead = `${transactionEditForm} input[name=payee]`,
	securityTypeahead = `${transactionEditForm} input[name=security]`,
	categoryTypeahead = `${transactionEditForm} #category`,
	amountInput = `${transactionEditForm} #amount`,
	subcategoryTypeahead = `${transactionEditForm} #subcategory`,
	accountTypeahead = `${transactionEditForm} #account`,
	subtransactionsTable = `${transactionEditForm} > div.modal-body > div > table`,
	subtransactionsTableRows = `${subtransactionsTable} > tbody > tr`,
	subtransactionCategoryTypeahead = "input[name=category]",
	subtransactionSubcategoryOrAccountTypeahead =
		"ng-form[name=accountForm] input",
	subtransactionMemoInput = "td:nth(2) input",
	subtransactionAmountInput = "input[name=amount]",
	subtransactionDeleteButtons = `${subtransactionsTableRows} > td > button`,
	subtransactionAddButton = `${subtransactionsTable} > tfoot > tr:first > td:first > button`,
	quantityInput = `${transactionEditForm} #quantity`,
	priceInput = `${transactionEditForm} #price`,
	commissionInput = `${transactionEditForm} #commission`,
	memoInput = `${transactionEditForm} #memo`;

export const cancelButton = `${transactionEditForm} div.modal-footer > button[type=button]`;
export const saveButton = `${transactionEditForm} > div.modal-footer > button[type=submit]`;

function populateSubtransactionWith(
	subtransaction: Subtransaction,
	index: number,
): void {
	const { categoryName, subcategoryOrAccountName, memo, rawAmount } =
		subtransaction;

	// Click the add button
	cy.get(subtransactionAddButton).click();

	cy.get(subtransactionsTableRows)
		.eq(index)
		.within((): void => {
			cy.typeahead(subtransactionCategoryTypeahead, categoryName);
			cy.typeahead(
				subtransactionSubcategoryOrAccountTypeahead,
				subcategoryOrAccountName,
			);
			cy.get(subtransactionMemoInput).clear().type(memo);
			cy.get(subtransactionAmountInput).clear().type(String(rawAmount));
		});
}

export function populateFormWith(transaction: TransactionEdit): void {
	const {
		rawTransactionDate,
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
	} = transaction;

	cy.get(transactionDateInput).clear().type(String(rawTransactionDate));

	if (undefined !== payeeName) {
		cy.typeahead(payeeTypeahead, payeeName);
	}

	if (undefined !== securityName) {
		cy.typeahead(securityTypeahead, securityName);
	}

	// Wait for last transaction details to finish auto-populating
	cy.get(memoInput).click();
	cy.contains("Finding last transaction for ").should("not.exist");

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
		cy.get(subtransactionDeleteButtons).each(
			(button: HTMLButtonElement): void => button.click(),
		);

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
}

export function invalidateForm(): void {
	cy.get(categoryTypeahead).clear();
}
