import type { Security } from "~/support/securities/types";

const securityName = "td:nth-of-type(1)",
	securityCode = "td:nth-of-type(2)",
	securityCurrentHolding = "td:nth-of-type(3)",
	securityClosingBalance = "td:nth-of-type(4)";

export const securitiesTableRows = "#securities > tbody > tr";
export const favouriteButton = "i[og-favourite]";
export const editButton = "i.glyphicon-edit";
export const noHoldingsTableRows = `${securitiesTableRows}.text-muted`;
export const unusedTableRows = `${securitiesTableRows} > td > em.text-info`;
export const negativeAmountTableRows = `${securitiesTableRows} > td.amount.text-danger`;
export const securityTotalValue = "tfoot > tr > th";

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Security {
	return {
		name: row.find(securityName).text().trim(),
		code: row.find(securityCode).text().trim(),
		holding: row.find(securityCurrentHolding).text().trim(),
		balance: row.find(securityClosingBalance).text().trim(),
		favourite: row.find(favouriteButton).hasClass("active"),
	};
}

export function checkRowMatches(
	expectedValues: Security,
	noTransactions = false,
): void {
	if (noTransactions) {
		cy.get(securityName)
			.contains(new RegExp(`${expectedValues.name}\\s+No transactions`, "v"))
			.should("exist");
	} else {
		cy.get(securityName).should("contain.text", expectedValues.name);
	}
	cy.get(securityCode).should("contain.text", expectedValues.code);
	cy.get(securityCurrentHolding).should("contain.text", expectedValues.holding);
	cy.get(securityClosingBalance).should("contain.text", expectedValues.balance);
	cy.get(favouriteButton).should(
		`${true === expectedValues.favourite ? "" : "not."}have.class`,
		"active",
	);
	cy.get(editButton).should("exist");
}
