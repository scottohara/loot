import type {
	Subtransaction,
	Transaction,
	TransactionEdit
} from "~/support/transactions/types";

export const transactionsIndexHeading = "h3";
export const transactionsTable = "#transactions";
export const transactionsTableRows = `${transactionsTable} > tbody > tr`;

const transactionTransactionDate = "> td:first",
			detailsTable = "> td.details:first > table > tbody > tr",
			transactionPayeeOrSecurityName = `${detailsTable}:first > td`,
			transactionCategoryName = `${detailsTable}:nth-of-type(2) > td:first`,
			transactionSubcategoryOrAccountName = `${detailsTable}:nth-of-type(2) > td:nth-of-type(2)`,
			transactionSubtransactionCategoryName = "> td:first",
			transactionSubtransactionSubcategoryOrAccountName = "> td:nth-of-type(2)",
			transactionSubtransactionMemo = "> td:nth-of-type(3)",
			transactionSubtransactionAmount = "> td.amount",
			transactionMemo = `${detailsTable}:last > td.memo`,
			transactionDebitAmount = "td:nth-of-type(3)",
			transactionQuantity = "td:nth-of-type(3) > table > tbody > tr:first > td",
			transactionCommissionLabel = "td:nth-of-type(3) > table > tbody > tr:last > td",
			transactionCreditAmount = "td:nth-of-type(4)",
			transactionPrice = "td:nth-of-type(4) > table > tbody > tr:first > td",
			transactionCommission = "td:nth-of-type(4) > table > tbody > tr:last > td",
			transactionBalanceOrAmount = "td:last";

export const transactionSubtransactionsToggleButton = `${detailsTable}:nth-of-type(2) > td:nth-of-type(2) > span > button.toggle-subtransactions`;
export const transactionSubtransactionsTableRows = `${detailsTable}:nth-of-type(3) > td > table > tbody > tr`;

export const transactionsClosingBalance = `${transactionsTable} > tfoot > tr:first > td:last`;

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Transaction {
	const subcategoryOrAccountName = row.find(transactionSubcategoryOrAccountName),
				creditAmount = row.find(transactionCreditAmount),
				debitAmount = row.find(transactionDebitAmount),
				price = row.find(transactionPrice),
				quantity = row.find(transactionQuantity),
				commission = row.find(transactionCommission),
				balanceOrAmount = row.find(transactionBalanceOrAmount);

	return {
		transactionDate: row.find(transactionTransactionDate).text().trim(),
		payeeOrSecurityName: row.find(transactionPayeeOrSecurityName).text().trim(),
		categoryName: row.find(transactionCategoryName).text().trim(),
		subcategoryOrAccountName: subcategoryOrAccountName.length ? subcategoryOrAccountName.text().trim() : undefined,
		subtransactions: row.find(transactionSubtransactionsToggleButton).length ? [] : undefined,
		memo: row.find(transactionMemo).text().trim(),
		creditAmount: creditAmount.length ? creditAmount.text().trim() : undefined,
		debitAmount: debitAmount.length ? debitAmount.text().trim() : undefined,
		price: price.length ? price.text().trim() : undefined,
		quantity: quantity.length ? quantity.text().trim() : undefined,
		commission: commission.length ? commission.text().trim() : undefined,
		balanceOrAmount: balanceOrAmount.length ? balanceOrAmount.text().trim() : undefined
	};
}

export function getSubtransactionRowValues(row: JQuery<HTMLTableRowElement>): Subtransaction {
	return {
		categoryName: row.find(transactionSubtransactionCategoryName).text().trim(),
		subcategoryOrAccountName: row.find(transactionSubtransactionSubcategoryOrAccountName).text().trim(),
		memo: row.find(transactionSubtransactionMemo).text().trim(),
		amount: row.find(transactionSubtransactionAmount).text().trim()
	};
}

export function checkRowMatches(expectedValues: Transaction | TransactionEdit): void {
	const {
		transactionDate,
		payeeOrSecurityName,
		categoryName,
		subcategoryOrAccountName,
		subtransactions,
		memo,
		debitAmount,
		creditAmount,
		quantity,
		price,
		commission,
		balanceOrAmount
	} = expectedValues;

	cy.get(transactionTransactionDate).should("contain.text", transactionDate);
	cy.get(transactionPayeeOrSecurityName).should("contain.text", payeeOrSecurityName);
	cy.get(transactionCategoryName).should("contain.text", categoryName);

	if (undefined === subtransactions && undefined !== subcategoryOrAccountName) {
		cy.get(transactionSubcategoryOrAccountName).should("contain.text", subcategoryOrAccountName);
	}

	cy.get(transactionSubtransactionsToggleButton).should(undefined === subtransactions ? "not.exist" : "be.visible");
	cy.get(transactionSubtransactionsTableRows).should("not.exist");
	cy.get(transactionMemo).should("contain.text", memo);

	if (undefined !== debitAmount) {
		cy.get(transactionDebitAmount).should("contain.text", debitAmount);
	}

	if (undefined !== creditAmount) {
		cy.get(transactionCreditAmount).should("contain.text", creditAmount);
	}

	if (undefined !== quantity) {
		cy.get(transactionQuantity).should("contain.text", quantity);
	}

	if (undefined !== price) {
		cy.get(transactionPrice).should("contain.text", price);
	}

	if (undefined !== commission) {
		cy.get(transactionCommissionLabel).should("contain.text", "Commission:");
		cy.get(transactionCommission).should("contain.text", commission);
	}

	if (undefined !== balanceOrAmount) {
		cy.get(transactionBalanceOrAmount).should("contain.text", balanceOrAmount);
	}
}

export function checkSubtransactionRowValues(expectedValues: Subtransaction): void {
	const {
		categoryName,
		subcategoryOrAccountName,
		memo,
		amount
	} = expectedValues;

	cy.get(transactionSubtransactionCategoryName).should("have.text", categoryName);
	cy.get(transactionSubtransactionSubcategoryOrAccountName).should("have.text", subcategoryOrAccountName);
	cy.get(transactionSubtransactionMemo).should("have.text", memo);
	cy.get(transactionSubtransactionAmount).should("have.text", amount);
}