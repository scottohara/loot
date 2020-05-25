import {
	Transaction,
	TransactionEdit,
	TransactionsContext
} from "../../support/transactions/types";
import {
	cancelButton,
	invalidateForm,
	populateFormWith,
	saveButton,
	transactionEditForm,
	transactionEditHeading
} from "../../support/transactions/edit";
import {
	checkRowMatches,
	checkSubtransactionRowValues,
	getValuesFrom,
	transactionSubtransactionsTableRows,
	transactionSubtransactionsToggleButton,
	transactionsClosingBalance,
	transactionsTableRows
} from "../../support/transactions/index";
import {
	lightFormat,
	startOfDay
} from "date-fns";

describe("Transaction Edit", (): void => {
	const today: Date = startOfDay(new Date()),
				transactionDate = lightFormat(today, "dd/MM/yyyy"),
				rawTransactionDate = lightFormat(today, "yyyy-MM-dd"),
				contexts: TransactionsContext[] = [
					{
						id: "1",
						heading: "bank account 1",
						transactions: [
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Category 2",
								subcategoryOrAccountName: "Category 1",
								memo: "Basic expense",
								debitAmount: "$1.00",
								balanceOrAmount: "$996.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "1",
								subcategoryName: "Category 1",
								closingBalance: "$996.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Category 4",
								subcategoryOrAccountName: "Category 3",
								memo: "Basic income",
								creditAmount: "$1.00",
								balanceOrAmount: "$997.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "1",
								subcategoryName: "Category 3",
								closingBalance: "$997.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Transfer To",
								subcategoryOrAccountName: "bank account 2",
								memo: "Transfer",
								debitAmount: "$1.00",
								balanceOrAmount: "$996.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "1",
								accountName: "bank account 2",
								closingBalance: "$996.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Split To",
								subtransactions: [
									{
										categoryName: "Category 2",
										subcategoryOrAccountName: "Category 1",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									},
									{
										categoryName: "Category 2",
										subcategoryOrAccountName: "Category 1",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									}
								],
								memo: "Split",
								debitAmount: "$2.00",
								balanceOrAmount: "$994.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "2",
								closingBalance: "$994.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Loan Repayment",
								subtransactions: [
									{
										categoryName: "Category 2",
										subcategoryOrAccountName: "Category 1",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									},
									{
										categoryName: "Category 2",
										subcategoryOrAccountName: "Category 1",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									}
								],
								memo: "Loan Repayment",
								debitAmount: "$2.00",
								balanceOrAmount: "$992.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "2",
								closingBalance: "$992.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Payee 1",
								categoryName: "Payslip",
								subtransactions: [
									{
										categoryName: "Category 4",
										subcategoryOrAccountName: "Category 3",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									},
									{
										categoryName: "Category 4",
										subcategoryOrAccountName: "Category 3",
										memo: "Sub transaction",
										amount: "$1.00",
										rawAmount: "1"
									}
								],
								memo: "Payslip",
								creditAmount: "$2.00",
								balanceOrAmount: "$994.00",
								rawTransactionDate,
								payeeName: "Payee 1",
								amount: "2",
								closingBalance: "$994.00"
							}
						]
					},
					{
						id: "4",
						heading: "investment account 3",
						transactions: [
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Buy",
								subcategoryOrAccountName: "bank account 2",
								memo: "2 @ $1.00 (plus $1.00 commission)",
								balanceOrAmount: "$1.00",
								rawTransactionDate,
								securityName: "Security 1",
								accountName: "bank account 2",
								quantity: "2",
								price: "1",
								commission: "1",
								memoFromInvestmentDetails: true,
								type: "Security Buy (no memo)",
								closingBalance: "$991.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Buy",
								subcategoryOrAccountName: "bank account 2",
								memo: "Security Buy",
								balanceOrAmount: "$1.00",
								rawTransactionDate,
								securityName: "Security 1",
								accountName: "bank account 2",
								quantity: "2",
								price: "1",
								commission: "1",
								closingBalance: "$993.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Sell",
								subcategoryOrAccountName: "bank account 2",
								memo: "Security Sell",
								balanceOrAmount: "$1.00",
								rawTransactionDate,
								securityName: "Security 1",
								accountName: "bank account 2",
								quantity: "2",
								price: "1",
								commission: "1",
								closingBalance: "$991.00"
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Add Shares",
								memo: "Security Add",
								rawTransactionDate,
								securityName: "Security 1",
								quantity: "1",
								closingBalance: ""
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Remove Shares",
								memo: "Security Remove",
								rawTransactionDate,
								securityName: "Security 1",
								quantity: "1",
								closingBalance: ""
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Transfer To",
								subcategoryOrAccountName: "investment account 8",
								memo: "Security Transfer",
								rawTransactionDate,
								securityName: "Security 1",
								accountName: "investment account 8",
								quantity: "1",
								closingBalance: ""
							},
							{
								transactionDate,
								payeeOrSecurityName: "Security 1",
								categoryName: "Dividend To",
								subcategoryOrAccountName: "bank account 1",
								memo: "Dividend",
								balanceOrAmount: "$1.00",
								rawTransactionDate,
								securityName: "Security 1",
								amount: "1",
								accountName: "bank account 1",
								closingBalance: "$988.00"
							}
						]
					}
				];

	let	expected: TransactionEdit,
			originalRowCount: number,
			lastTransaction: Transaction,
			originalClosingBalance: string;

	function commonBehaviour(): void {
		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(transactionEditForm).should("not.be.visible");

			// Row count should not have changed
			cy.get(transactionsTableRows).should("have.length", originalRowCount);

			// Transaction in the last row should not have changed
			cy.get(transactionsTableRows).last().within((): void => checkRowMatches(lastTransaction));

			// Closing balance should not have changed
			cy.get(transactionsClosingBalance).should("have.text", originalClosingBalance);
		});

		describe("invalid data", (): void => {
			beforeEach((): void => invalidateForm());

			it("should not enable the save button", (): Cypress.Chainable<JQuery> => cy.get(saveButton).should("not.be.enabled"));

			// MISSING - XXXX payee name should show red cross when invalid

			// MISSING - XXXX form group around payee name should have 'has-error' class when invalid
		});

		// MISSING - error message should display when present

		// MISSING - XXXX payee name text should be selected when input gets focus
	}

	before((): void => cy.createTransactions());

	contexts.forEach(({ id, heading, transactions }: TransactionsContext): void => {
		describe(heading, (): void => {
			beforeEach((): void => {
				cy.login();
				cy.visit(`/#!/accounts/${id}/transactions`);
				cy.get(transactionsTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
					originalRowCount = rows.length;
					lastTransaction = getValuesFrom(rows.last());
				});
				cy.get(transactionsClosingBalance).then((closingBalance: JQuery<HTMLTableCellElement>): void => {
					originalClosingBalance = closingBalance.text().trim();
				});
			});

			describe("adding a transaction", (): void => {
				beforeEach((): void => {
					cy.get("body").type("{insert}");
					cy.get(transactionEditHeading).should("have.text", "Add Transaction");
				});

				transactions.forEach((transaction: TransactionEdit): void => {
					describe(undefined === transaction.type ? transaction.memo : transaction.type, (): void => {
						beforeEach((): void => {
							expected = transaction;
							populateFormWith(expected);
						});

						commonBehaviour();

						it("should insert a new transaction when the save button is clicked", (): void => {
							cy.get(saveButton).click();
							cy.get(transactionEditForm).should("not.be.visible");

							// Row count should have incremented by one
							cy.get(transactionsTableRows).should("have.length", originalRowCount + 1);

							// Transaction in the last row should be the new transaction
							cy.get(transactionsTableRows).last().within((): void => {
								const { subtransactions } = expected;

								checkRowMatches(expected);

								if (undefined !== subtransactions) {
									cy.get(transactionSubtransactionsToggleButton).click();

									// Number of rows
									cy.get(transactionSubtransactionsTableRows).should("have.length", subtransactions.length);

									cy.get(transactionSubtransactionsTableRows).each((subtransactionRow: HTMLTableRowElement, subIndex: number): void => {
										cy.wrap(subtransactionRow).within((): void => checkSubtransactionRowValues(subtransactions[subIndex]));
									});
								}
							});

							// Closing balance should match the new closing balance
							cy.get(transactionsClosingBalance).should("have.text", expected.closingBalance);
						});
					});
				});
			});

			// MISSING - editing a schedule
		});
	});
});