import { addDays, lightFormat, startOfDay } from "date-fns";
import {
	checkRowMatches,
	checkSubtransactionRowValues,
	scheduleSubtransactionsTableRows,
	scheduleSubtransactionsToggleButton,
	schedulesTableRows,
} from "~/support/schedules/index";
import {
	scheduleDeleteForm,
	scheduleDeleteHeading,
} from "~/support/schedules/delete";
import {
	scheduleEditForm,
	scheduleEditHeading,
} from "~/support/schedules/edit";
import type { Schedule } from "~/support/schedules/types";
import { testNavigableTable } from "~/support/og-components/og-table-navigable";

describe("Schedule Index", (): void => {
	let expected: Schedule[];

	before((): void => {
		const tomorrow = lightFormat(
			addDays(startOfDay(new Date()), 1),
			"dd/MM/yyyy",
		);

		expected = [
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
				payeeOrSecurityName: "Payee 1",
				categoryName: "Category 2",
				subcategoryOrAccountName: "Category 1",
				memo: "Basic transaction",
				frequency: "Monthly",
				debitAmount: "~$1.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
				payeeOrSecurityName: "Payee 1",
				categoryName: "Category 4",
				subcategoryOrAccountName: "Category 3",
				memo: "Basic transaction",
				frequency: "Monthly",
				creditAmount: "~$1.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
				payeeOrSecurityName: "Payee 1",
				categoryName: "Transfer To",
				subcategoryOrAccountName: "bank account 4",
				memo: "Transfer transaction",
				frequency: "Monthly",
				debitAmount: "~$1.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
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
				frequency: "Monthly",
				debitAmount: "~$2.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
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
				frequency: "Monthly",
				debitAmount: "~$2.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "bank account 1",
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
				frequency: "Monthly",
				creditAmount: "~$2.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Buy",
				subcategoryOrAccountName: "bank account 3",
				memo: "SecurityInvestment transaction",
				frequency: "Monthly",
				creditAmount: "~$2.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Sell",
				subcategoryOrAccountName: "bank account 3",
				memo: "SecurityInvestment transaction",
				frequency: "Monthly",
				debitAmount: "~$0.00",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Add Shares",
				memo: "SecurityHolding transaction",
				frequency: "Monthly",
				creditAmount: "",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Remove Shares",
				memo: "SecurityHolding transaction",
				frequency: "Monthly",
				debitAmount: "",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Transfer To",
				subcategoryOrAccountName: "investment account 8",
				memo: "SecurityTransfer transaction",
				frequency: "Monthly",
				debitAmount: "",
			},
			{
				nextDueDate: tomorrow,
				isAutoEntered: true,
				primaryAccountName: "investment account 2",
				payeeOrSecurityName: "Security 1",
				categoryName: "Dividend To",
				subcategoryOrAccountName: "bank account 1",
				memo: "Dividend transaction",
				frequency: "Monthly",
				debitAmount: "~$1.00",
			},
		];

		cy.createSchedules();
	});

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/schedules");
	});

	it("should display a row for each schedule", (): void => {
		// Number of rows
		cy.get(schedulesTableRows).should("have.length", expected.length);

		cy.get(schedulesTableRows).each(
			(row: HTMLTableRowElement, index: number): void => {
				cy.wrap(row).within((): void => checkRowMatches(expected[index]));
			},
		);
	});

	describe("subtransactions", (): void => {
		it("should display the subtransactions", (): void => {
			cy.get(schedulesTableRows).each(
				(row: HTMLTableRowElement, index: number): void => {
					const { subtransactions } = expected[index];

					if (undefined !== subtransactions) {
						cy.wrap(row).within((): void => {
							cy.get(scheduleSubtransactionsToggleButton).click();

							// Number of rows
							cy.get(scheduleSubtransactionsTableRows).should(
								"have.length",
								subtransactions.length,
							);

							cy.get(scheduleSubtransactionsTableRows).each(
								(
									subtransactionRow: HTMLTableRowElement,
									subIndex: number,
								): void => {
									cy.wrap(subtransactionRow).within((): void =>
										checkSubtransactionRowValues(subtransactions[subIndex]),
									);
								},
							);
						});
					}
				},
			);
		});

		it("should hide the subtransactions", (): void => {
			cy.get(schedulesTableRows).each(
				(row: HTMLTableRowElement, index: number): void => {
					const { subtransactions } = expected[index];

					if (undefined !== subtransactions) {
						cy.wrap(row).within((): void => {
							cy.get(scheduleSubtransactionsTableRows).should("not.exist");
							cy.get(scheduleSubtransactionsToggleButton).click();
							cy.get(scheduleSubtransactionsTableRows).should("be.visible");
							cy.get(scheduleSubtransactionsToggleButton).click();
							cy.get(scheduleSubtransactionsTableRows).should("not.be.visible");
						});
					}
				},
			);
		});
	});

	testNavigableTable({
		rows: schedulesTableRows,
		actions: {
			insert: {
				heading: scheduleEditHeading,
				headingText: "Add Schedule",
				view: scheduleEditForm,
			},
			edit: {
				heading: scheduleEditHeading,
				headingText: "Enter Transaction",
				view: scheduleEditForm,
			},
			del: {
				heading: scheduleDeleteHeading,
				headingText: "Delete Schedule?",
				view: scheduleDeleteForm,
			},
			select: {
				heading: scheduleEditHeading,
				headingText: "Enter Transaction",
				view: scheduleEditForm,
			},
		},
	});
});
