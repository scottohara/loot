import {
	cancelButton,
	checkFormMatches,
	invalidateForm,
	payeeEditForm,
	payeeEditHeading,
	populateFormWith,
	saveButton
} from "payees/edit";
import {
	checkRowMatches,
	getValuesFrom,
	payeesTableRows
} from "payees/index";
import { Payee } from "payees/types";

describe("Payee Edit", (): void => {
	let	expected: Payee,
			originalRowCount: number,
			firstPayee: Payee,
			lastPayee: Payee;

	function commonBehaviour(): void {
		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(payeeEditForm).should("not.exist");

			// Row count should not have changed
			cy.get(payeesTableRows).should("have.length", originalRowCount);

			// Payee in the last row should not have changed
			cy.get(payeesTableRows).last().within((): void => checkRowMatches(lastPayee));
		});

		describe("invalid data", (): void => {
			beforeEach((): void => invalidateForm());

			it("should not enable the save button", (): Cypress.Chainable<JQuery> => cy.get(saveButton).should("not.be.enabled"));

			// MISSING - payee name should show red cross when invalid

			// MISSING - form group around payee name should have 'has-error' class when invalid
		});

		// MISSING - error message should display when present

		// MISSING - payee name text should be selected when input gets focus
	}

	before((): void => cy.createPayees());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/payees");
		cy.get(payeesTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
			originalRowCount = rows.length;
			firstPayee = getValuesFrom(rows.first());
			lastPayee = getValuesFrom(rows.last());
		});
	});

	describe("adding a payee", (): void => {
		beforeEach((): void => {
			expected = { name: "Test payee" };
			cy.get("body").type("{insert}");
			cy.get(payeeEditHeading).should("have.text", "Add Payee");
			populateFormWith(expected);
		});

		commonBehaviour();

		it("should insert a new payee when the save button is clicked", (): void => {
			cy.get(saveButton).click();
			cy.get(payeeEditForm).should("not.exist");

			// Row count should have incremented by one
			cy.get(payeesTableRows).should("have.length", originalRowCount + 1);

			// Payee in the last row should be the new payee
			cy.get(payeesTableRows).last().within((): void => checkRowMatches(expected));
		});
	});

	describe("editing a payee", (): void => {
		beforeEach((): void => {
			expected = { name: "Test payee (edited)" };
			cy.get(payeesTableRows).eq(0).click();
			cy.get("body").type("{ctrl}e");
			cy.get(payeeEditHeading).should("have.text", "Edit Payee");
			checkFormMatches(firstPayee);
			populateFormWith(expected);
		});

		commonBehaviour();

		it("should update an existing payee when the save button is clicked", (): void => {
			cy.get(saveButton).click();
			cy.get(payeeEditForm).should("not.exist");

			// Row count should not have changed
			cy.get(payeesTableRows).should("have.length", originalRowCount);

			// Payee in the last row should be the new payee
			cy.get(payeesTableRows).last().within((): void => checkRowMatches(expected));
		});
	});
});