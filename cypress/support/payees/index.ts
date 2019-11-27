import { Payee } from "payees/types";

export const payeesTableRows = "#payees > tbody > tr";

const payeeName = "td";

export const favouriteButton = "i[og-favourite]";
export const editButton = "i.glyphicon-edit";

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Payee {
	return {
		name: row.find(payeeName).text().trim(),
		favourite: row.find(favouriteButton).hasClass("active")
	};
}

export function checkRowMatches(expectedValues: Payee): void {
	cy.get(payeeName).should("contain.text", expectedValues.name);
	cy.get(favouriteButton).should(`${true === expectedValues.favourite ? "" : "not."}have.class`, "active");
	cy.get(editButton).should("exist");
}