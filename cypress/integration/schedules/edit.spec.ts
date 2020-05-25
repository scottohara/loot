import {
	Schedule,
	ScheduleEdit
} from "../../support/schedules/types";
import {
	addDays,
	lightFormat,
	startOfDay
} from "date-fns";
import {
	cancelButton,
	invalidateForm,
	populateFormWith,
	saveButton,
	scheduleEditForm,
	scheduleEditHeading
} from "../../support/schedules/edit";
import {
	checkRowMatches,
	checkSubtransactionRowValues,
	getValuesFrom,
	scheduleSubtransactionsTableRows,
	scheduleSubtransactionsToggleButton,
	schedulesTableRows
} from "../../support/schedules/index";

describe("Schedule Edit", (): void => {
	let	expected: ScheduleEdit,
			originalRowCount: number,
			lastSchedule: Schedule;

	function commonBehaviour(): void {
		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(scheduleEditForm).should("not.be.visible");

			// Row count should not have changed
			cy.get(schedulesTableRows).should("have.length", originalRowCount);

			// Schedule in the last row should not have changed
			cy.get(schedulesTableRows).last().within((): void => checkRowMatches(lastSchedule));
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

	before((): void => cy.createSchedules());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/schedules");
		cy.get(schedulesTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
			originalRowCount = rows.length;
			lastSchedule = getValuesFrom(rows.last());
		});
	});

	describe("adding a schedule", (): void => {
		const tomorrow: Date = addDays(startOfDay(new Date()), 1),
					nextDueDate: string = lightFormat(tomorrow, "dd/MM/yyyy"),
					rawNextDueDate: string = lightFormat(tomorrow, "yyyy-MM-dd"),
					schedules: ScheduleEdit[] = [
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "bank account 1",
							payeeOrSecurityName: "Payee 1",
							categoryName: "Category 2",
							subcategoryOrAccountName: "Category 1",
							memo: "Basic expense",
							frequency: "Monthly",
							debitAmount: "~$1.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "1",
							subcategoryName: "Category 1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "bank account 1",
							payeeOrSecurityName: "Payee 1",
							categoryName: "Category 4",
							subcategoryOrAccountName: "Category 3",
							memo: "Basic income",
							frequency: "Monthly",
							creditAmount: "~$1.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "1",
							subcategoryName: "Category 3",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "bank account 1",
							payeeOrSecurityName: "Payee 1",
							categoryName: "Transfer To",
							subcategoryOrAccountName: "bank account 3",
							memo: "Transfer",
							frequency: "Monthly",
							debitAmount: "~$1.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "1",
							accountName: "bank account 3",
							isEstimate: true
						},
						{
							nextDueDate,
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
							frequency: "Monthly",
							debitAmount: "~$2.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "2",
							isEstimate: true
						},
						{
							nextDueDate,
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
							frequency: "Monthly",
							debitAmount: "~$2.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "2",
							isEstimate: true
						},
						{
							nextDueDate,
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
							frequency: "Monthly",
							creditAmount: "~$2.00",
							rawNextDueDate,
							payeeName: "Payee 1",
							amount: "2",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Buy",
							subcategoryOrAccountName: "bank account 3",
							memo: "2 @ $1.00 (plus $1.00 commission)",
							frequency: "Monthly",
							creditAmount: "~$3.00",
							rawNextDueDate,
							securityName: "Security 1",
							accountName: "bank account 3",
							quantity: "2",
							price: "1",
							commission: "1",
							memoFromInvestmentDetails: true,
							type: "Security Buy (no memo)",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Buy",
							subcategoryOrAccountName: "bank account 3",
							memo: "Security Buy",
							frequency: "Monthly",
							creditAmount: "~$3.00",
							rawNextDueDate,
							securityName: "Security 1",
							accountName: "bank account 3",
							quantity: "2",
							price: "1",
							commission: "1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Sell",
							subcategoryOrAccountName: "bank account 3",
							memo: "Security Sell",
							frequency: "Monthly",
							debitAmount: "~$1.00",
							rawNextDueDate,
							securityName: "Security 1",
							accountName: "bank account 3",
							quantity: "2",
							price: "1",
							commission: "1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Add Shares",
							memo: "Security Add",
							frequency: "Monthly",
							rawNextDueDate,
							securityName: "Security 1",
							quantity: "1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Remove Shares",
							memo: "Security Remove",
							frequency: "Monthly",
							rawNextDueDate,
							securityName: "Security 1",
							quantity: "1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Transfer To",
							subcategoryOrAccountName: "investment account 8",
							memo: "Security Transfer",
							frequency: "Monthly",
							rawNextDueDate,
							securityName: "Security 1",
							accountName: "investment account 8",
							quantity: "1",
							isEstimate: true
						},
						{
							nextDueDate,
							isAutoEntered: true,
							primaryAccountName: "investment account 2",
							payeeOrSecurityName: "Security 1",
							categoryName: "Dividend To",
							subcategoryOrAccountName: "bank account 1",
							memo: "Dividend",
							frequency: "Monthly",
							debitAmount: "~$1.00",
							rawNextDueDate,
							securityName: "Security 1",
							amount: "1",
							accountName: "bank account 1",
							isEstimate: true
						}
					];

		beforeEach((): void => {
			cy.get("body").type("{insert}");
			cy.get(scheduleEditHeading).should("have.text", "Add Schedule");
		});

		schedules.forEach((schedule: ScheduleEdit): void => {
			describe(undefined === schedule.type ? schedule.memo : schedule.type, (): void => {
				beforeEach((): void => {
					expected = schedule;
					populateFormWith(expected);
				});

				commonBehaviour();

				it("should insert a new schedule when the save button is clicked", (): void => {
					cy.get(saveButton).click();
					cy.get(scheduleEditForm).should("not.be.visible");

					// Row count should have incremented by one
					cy.get(schedulesTableRows).should("have.length", originalRowCount + 1);

					// Schedule in the last row should be the new schedule
					cy.get(schedulesTableRows).last().within((): void => {
						const { subtransactions } = expected;

						checkRowMatches(expected);

						if (undefined !== subtransactions) {
							cy.get(scheduleSubtransactionsToggleButton).click();

							// Number of rows
							cy.get(scheduleSubtransactionsTableRows).should("have.length", subtransactions.length);

							cy.get(scheduleSubtransactionsTableRows).each((subtransactionRow: HTMLTableRowElement, subIndex: number): void => {
								cy.wrap(subtransactionRow).within((): void => checkSubtransactionRowValues(subtransactions[subIndex]));
							});
						}
					});
				});
			});
		});
	});

	// MISSING - editing a schedule
});