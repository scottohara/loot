import {
	Schedule,
	ScheduleEdit
} from "schedules/types";
import { Subtransaction } from "transactions/types";

export const schedulesTableRows = "#transactions > tbody > tr";

const	scheduleNextDueDate = "> td:first",
			scheduleIsAutoEntered = "> td:first > i.glyphicon-pushpin",
			schedulePrimaryAccountName = "> td:nth-of-type(2)",
			detailsTable = "> td.details:first > table > tbody > tr",
			schedulePayeeOrSecurityName = `${detailsTable}:first > td`,
			scheduleCategoryName = `${detailsTable}:nth-of-type(2) > td:first`,
			scheduleSubcategoryOrAccountName = `${detailsTable}:nth-of-type(2) > td:nth-of-type(2)`,
			scheduleSubtransactionCategoryName = "> td:first",
			scheduleSubtransactionSubcategoryOrAccountName = "> td:nth-of-type(2)",
			scheduleSubtransactionMemo = "> td:nth-of-type(3)",
			scheduleSubtransactionAmount = "> td.amount",
			scheduleMemo = `${detailsTable}:last > td.memo`,
			scheduleFrequency = "td:nth-of-type(4)",
			scheduleDebitAmount = "td:nth-of-type(5)",
			scheduleCreditAmount = "td:last";

export const scheduleSubtransactionsToggleButton = `${detailsTable}:nth-of-type(2) > td:nth-of-type(2) > button.toggle-subtransactions`;
export const scheduleSubtransactionsTableRows = `${detailsTable}:nth-of-type(3) > td > table > tbody > tr`;

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Schedule {
	const subcategoryOrAccount = row.find(scheduleSubcategoryOrAccountName);

	return {
		nextDueDate: row.find(scheduleNextDueDate).text().trim(),
		isAutoEntered: row.find(scheduleIsAutoEntered).length > 0,
		primaryAccountName: row.find(schedulePrimaryAccountName).text().trim(),
		payeeOrSecurityName: row.find(schedulePayeeOrSecurityName).text().trim(),
		categoryName: row.find(scheduleCategoryName).text().trim(),
		subcategoryOrAccountName: subcategoryOrAccount.length > 0 ? subcategoryOrAccount.text().trim() : undefined,
		subtransactions: row.find(scheduleSubtransactionsToggleButton).length > 0 ? [] : undefined,
		memo: row.find(scheduleMemo).text().trim(),
		frequency: row.find(scheduleFrequency).text().trim(),
		creditAmount: row.find(scheduleCreditAmount).text().trim(),
		debitAmount: row.find(scheduleDebitAmount).text().trim()
	};
}

export function getSubtransactionRowValues(row: JQuery<HTMLTableRowElement>): Subtransaction {
	return {
		categoryName: row.find(scheduleSubtransactionCategoryName).text().trim(),
		subcategoryOrAccountName: row.find(scheduleSubtransactionSubcategoryOrAccountName).text().trim(),
		memo: row.find(scheduleSubtransactionMemo).text().trim(),
		amount: row.find(scheduleSubtransactionAmount).text().trim()
	};
}

export function checkRowMatches(expectedValues: Schedule | ScheduleEdit): void {
	const {
		nextDueDate,
		isAutoEntered,
		primaryAccountName,
		payeeOrSecurityName,
		categoryName,
		subcategoryOrAccountName,
		subtransactions,
		memo,
		frequency,
		debitAmount,
		creditAmount
	} = expectedValues;

	cy.get(scheduleNextDueDate).should("contain.text", nextDueDate);
	cy.get(scheduleIsAutoEntered).should(`${true === isAutoEntered ? "" : "not."}be.visible`);
	cy.get(schedulePrimaryAccountName).should("have.text", primaryAccountName);
	cy.get(schedulePayeeOrSecurityName).should("have.text", payeeOrSecurityName);
	cy.get(scheduleCategoryName).should("have.text", categoryName);

	if (undefined === subtransactions && undefined !== subcategoryOrAccountName) {
		cy.get(scheduleSubcategoryOrAccountName).should("have.text", subcategoryOrAccountName);
	}

	cy.get(scheduleSubtransactionsToggleButton).should(`${undefined === subtransactions ? "not." : ""}be.visible`);
	cy.get(scheduleSubtransactionsTableRows).should("not.be.visible");
	cy.get(scheduleMemo).should("contain.text", memo);
	cy.get(scheduleFrequency).should("have.text", frequency);
	cy.get(scheduleDebitAmount).should("contain.text", debitAmount ?? "");
	cy.get(scheduleCreditAmount).should("contain.text", creditAmount ?? "");
}

export function checkSubtransactionRowValues(expectedValues: Subtransaction): void {
	const {
		categoryName,
		subcategoryOrAccountName,
		memo,
		amount
	} = expectedValues;

	cy.get(scheduleSubtransactionCategoryName).should("have.text", categoryName);
	cy.get(scheduleSubtransactionSubcategoryOrAccountName).should("have.text", subcategoryOrAccountName);
	cy.get(scheduleSubtransactionMemo).should("have.text", memo);
	cy.get(scheduleSubtransactionAmount).should("have.text", amount);
}