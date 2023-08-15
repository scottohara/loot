import type { Account } from "~/support/accounts/types";

export const accountTypeTables = "table.accounts.table.table-striped";
export const accountType = `${accountTypeTables} > thead > tr > th`;
export const accountsTableRows = `${accountTypeTables} > tbody > tr`;
export const accountsTableTotals = `${accountTypeTables} > tfoot > tr > th`;
export const accountsTotal = "table:last > thead > tr > th";
export const accountName = "td:first > a";
export const investmentAccountsTableRows = `${accountTypeTables}:nth-of-type(4) > tbody > tr`;
export const linkedCashAccount = "td > span > a";

const closingBalance = "td.amount";

export const favouriteButton = "i[og-favourite]";
export const deleteButton = "i.glyphicon-trash";
export const editButton = "i.glyphicon-edit";
export const closedAccountTableRows = `${accountsTableRows}.closed-account`;
export const negativeBalanceTableRows = `${accountsTableRows} > td.amount.text-danger`;
export const negativeTableTotals = `${accountsTableTotals}.amount.text-danger`;
export const negativeTotal = `${accountsTotal}.amount.text-danger`;

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Account {
	return {
		name: row.find(accountName).text().trim(),
		closingBalance: row.find(closingBalance).text().trim(),
		favourite: row.find(favouriteButton).hasClass("active")
	};
}

export function checkRowMatches(expectedValues: Account): void {
	cy.get(accountName).should("have.text", expectedValues.name);
	cy.get(closingBalance).should("have.text", expectedValues.closingBalance);
	cy.get(favouriteButton).should(`${true === expectedValues.favourite ? "" : "not."}have.class`, "active");
	cy.get(deleteButton).should("exist");
	cy.get(editButton).should("exist");
}