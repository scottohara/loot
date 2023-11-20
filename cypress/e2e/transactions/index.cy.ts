import {
	checkRowMatches,
	checkSubtransactionRowValues,
	transactionSubtransactionsTableRows,
	transactionSubtransactionsToggleButton,
	transactionsClosingBalance,
	transactionsIndexHeading,
	transactionsTableRows,
} from "~/support/transactions/index";
import {
	transactionDeleteForm,
	transactionDeleteHeading,
} from "~/support/transactions/delete";
import {
	transactionEditForm,
	transactionEditHeading,
} from "~/support/transactions/edit";
import type { TransactionsContext } from "~/support/transactions/types";
import { testNavigableTable } from "~/support/og-components/og-table-navigable";

describe("Transaction Index", (): void => {
	const expected: TransactionsContext[] = [
		{
			id: "1",
			heading: "bank account 1",
			transactions: [
				{
					transactionDate: "01/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Category 2",
					subcategoryOrAccountName: "Category 1",
					memo: "Basic transaction",
					debitAmount: "$1.00",
					balanceOrAmount: "$999.00",
				},
				{
					transactionDate: "02/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Category 4",
					subcategoryOrAccountName: "Category 3",
					memo: "Basic transaction",
					creditAmount: "$1.00",
					balanceOrAmount: "$1,000.00",
				},
				{
					transactionDate: "03/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Transfer To",
					subcategoryOrAccountName: "bank account 2",
					memo: "Transfer transaction",
					debitAmount: "$1.00",
					balanceOrAmount: "$999.00",
				},
				{
					transactionDate: "04/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Split To",
					subtransactions: [
						{
							categoryName: "Category 2",
							subcategoryOrAccountName: "Category 1",
							memo: "Sub transaction",
							amount: "$1.00",
						},
						{
							categoryName: "Category 2",
							subcategoryOrAccountName: "Category 1",
							memo: "Sub transaction",
							amount: "$1.00",
						},
					],
					memo: "Split transaction",
					debitAmount: "$2.00",
					balanceOrAmount: "$997.00",
				},
				{
					transactionDate: "05/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Loan Repayment",
					subtransactions: [
						{
							categoryName: "Category 2",
							subcategoryOrAccountName: "Category 1",
							memo: "Sub transaction",
							amount: "$1.00",
						},
						{
							categoryName: "Category 2",
							subcategoryOrAccountName: "Category 1",
							memo: "Sub transaction",
							amount: "$1.00",
						},
					],
					memo: "LoanRepayment transaction",
					debitAmount: "$2.00",
					balanceOrAmount: "$995.00",
				},
				{
					transactionDate: "06/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Payslip",
					subtransactions: [
						{
							categoryName: "Category 4",
							subcategoryOrAccountName: "Category 3",
							memo: "Sub transaction",
							amount: "$1.00",
						},
						{
							categoryName: "Category 4",
							subcategoryOrAccountName: "Category 3",
							memo: "Sub transaction",
							amount: "$1.00",
						},
					],
					memo: "Payslip transaction",
					creditAmount: "$2.00",
					balanceOrAmount: "$997.00",
				},
			],
			closingBalance: "$997.00",
		},
		{
			id: "2",
			heading: "bank account 2",
			transactions: [
				{
					transactionDate: "03/01/2014",
					payeeOrSecurityName: "Payee 1",
					categoryName: "Transfer From",
					subcategoryOrAccountName: "bank account 1",
					memo: "Transfer transaction",
					creditAmount: "$1.00",
					balanceOrAmount: "$1,001.00",
				},
				{
					transactionDate: "12/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Dividend From",
					subcategoryOrAccountName: "investment account 3",
					memo: "Dividend transaction",
					creditAmount: "$1.00",
					balanceOrAmount: "$1,002.00",
				},
			],
			closingBalance: "$1,002.00",
		},
		{
			id: "3",
			heading: "bank account 4",
			transactions: [
				{
					transactionDate: "07/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Transfer To",
					subcategoryOrAccountName: "investment account 3",
					memo: "SecurityInvestment transaction",
					debitAmount: "$2.00",
					balanceOrAmount: "$998.00",
				},
				{
					transactionDate: "08/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Transfer From",
					subcategoryOrAccountName: "investment account 3",
					memo: "SecurityInvestment transaction",
					creditAmount: "$0.00",
					balanceOrAmount: "$998.00",
				},
			],
			closingBalance: "$998.00",
		},
		{
			id: "4",
			heading: "investment account 3",
			transactions: [
				{
					transactionDate: "07/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Buy",
					subcategoryOrAccountName: "bank account 4",
					memo: "SecurityInvestment transaction",
					quantity: "1.0000",
					price: "$1",
					commission: "$1.00",
					balanceOrAmount: "$2.00",
				},
				{
					transactionDate: "08/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Sell",
					subcategoryOrAccountName: "bank account 4",
					memo: "SecurityInvestment transaction",
					quantity: "1.0000",
					price: "$1",
					commission: "$1.00",
					balanceOrAmount: "$0.00",
				},
				{
					transactionDate: "09/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Add Shares",
					memo: "SecurityHolding transaction",
					quantity: "10.0000",
				},
				{
					transactionDate: "10/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Remove Shares",
					memo: "SecurityHolding transaction",
					quantity: "10.0000",
				},
				{
					transactionDate: "11/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Transfer To",
					subcategoryOrAccountName: "investment account 8",
					memo: "SecurityTransfer transaction",
					quantity: "10.0000",
				},
				{
					transactionDate: "12/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Dividend To",
					subcategoryOrAccountName: "bank account 2",
					memo: "Dividend transaction",
					balanceOrAmount: "$1.00",
				},
			],
			closingBalance: "$988.00",
		},
		{
			id: "5",
			heading: "bank account 9",
			transactions: [],
			closingBalance: "$1,000.00",
		},
		{
			id: "6",
			heading: "investment account 8",
			transactions: [
				{
					transactionDate: "11/01/2014",
					payeeOrSecurityName: "Security 1",
					categoryName: "Transfer From",
					subcategoryOrAccountName: "investment account 3",
					memo: "SecurityTransfer transaction",
					quantity: "10.0000",
				},
			],
			closingBalance: "$1,010.00",
		},
	];

	before((): void => cy.createTransactions());

	expected.forEach(
		(
			{ id, heading, transactions, closingBalance }: TransactionsContext,
			index: number,
		): void => {
			describe(heading, (): void => {
				beforeEach((): void => {
					cy.login();
					cy.visit(`/#!/accounts/${id}/transactions`);
				});

				it("should display the context name", (): Cypress.Chainable<JQuery> =>
					cy.get(transactionsIndexHeading).should("have.text", heading));

				it("should display a row for each transaction", (): void => {
					if (transactions.length) {
						// Number of rows
						cy.get(transactionsTableRows).should(
							"have.length",
							transactions.length,
						);

						cy.get(transactionsTableRows).each(
							(row: HTMLTableRowElement, transactionsIndex: number): void => {
								cy.wrap(row).within((): void =>
									checkRowMatches(transactions[transactionsIndex]),
								);
							},
						);
					} else {
						cy.get(transactionsTableRows).should("not.exist");
					}
				});

				describe("subtransactions", (): void => {
					it("should display the subtransactions", (): void => {
						if (transactions.length) {
							cy.get(transactionsTableRows).each(
								(row: HTMLTableRowElement, transactionsIndex: number): void => {
									const { subtransactions } = transactions[transactionsIndex];

									if (undefined !== subtransactions) {
										cy.wrap(row).within((): void => {
											cy.get(transactionSubtransactionsToggleButton).click();

											// Number of rows
											cy.get(transactionSubtransactionsTableRows).should(
												"have.length",
												subtransactions.length,
											);

											cy.get(transactionSubtransactionsTableRows).each(
												(
													subtransactionRow: HTMLTableRowElement,
													subIndex: number,
												): void => {
													cy.wrap(subtransactionRow).within((): void =>
														checkSubtransactionRowValues(
															subtransactions[subIndex],
														),
													);
												},
											);
										});
									}
								},
							);
						}
					});

					it("should hide the subtransactions", (): void => {
						if (transactions.length) {
							cy.get(transactionsTableRows).each(
								(row: HTMLTableRowElement, transactionIndex: number): void => {
									const { subtransactions } = transactions[transactionIndex];

									if (undefined !== subtransactions) {
										cy.wrap(row).within((): void => {
											cy.get(transactionSubtransactionsTableRows).should(
												"not.exist",
											);
											cy.get(transactionSubtransactionsToggleButton).click();
											cy.get(transactionSubtransactionsTableRows).should(
												"be.visible",
											);
											cy.get(transactionSubtransactionsToggleButton).click();
											cy.get(transactionSubtransactionsTableRows).should(
												"not.be.visible",
											);
										});
									}
								},
							);
						}
					});
				});

				it("should display the closing balance", (): Cypress.Chainable<JQuery> =>
					cy
						.get(transactionsClosingBalance)
						.should("contain.text", closingBalance));

				if (!index) {
					testNavigableTable({
						rows: transactionsTableRows,
						actions: {
							insert: {
								heading: transactionEditHeading,
								headingText: "Add Transaction",
								view: transactionEditForm,
							},
							edit: {
								heading: transactionEditHeading,
								headingText: "Edit Transaction",
								view: transactionEditForm,
							},
							del: {
								heading: transactionDeleteHeading,
								headingText: "Delete Transaction?",
								view: transactionDeleteForm,
							},
							select: {
								heading: transactionEditHeading,
								headingText: "Edit Transaction",
								view: transactionEditForm,
							},
						},
					});
				}
			});
		},
	);
});
