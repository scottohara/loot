import {
	cancelButton,
	checkFormMatches,
	invalidateForm,
	populateFormWith,
	saveButton,
	securityEditForm,
	securityEditHeading
} from "securities/edit";
import {
	checkRowMatches,
	getValuesFrom,
	securitiesTableRows
} from "securities/index";
import { Security } from "securities/types";

describe("securityEditView", (): void => {
	let	expected: Security,
			originalRowCount: number,
			firstSecurity: Security,
			lastSecurity: Security;

	function commonBehaviour(): void {
		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(securityEditForm).should("not.be.visible");

			// Row count should not have changed
			cy.get(securitiesTableRows).should("have.length", originalRowCount);

			// Security in the last row should not have changed
			cy.get(securitiesTableRows).last().within((): void => checkRowMatches(lastSecurity));
		});

		describe("invalid data", (): void => {
			beforeEach((): void => invalidateForm());

			it("should not enable the save button", (): Cypress.Chainable<JQuery> => cy.get(saveButton).should("not.be.enabled"));

			// MISSING - security name should show red cross when invalid

			// MISSING - form group around security name should have 'has-error' class when invalid
		});

		// MISSING - error message should display when present

		// MISSING - security name text should be selected when input gets focus
	}

	before((): void => cy.createSecurities());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/securities");
		cy.get(securitiesTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
			originalRowCount = rows.length;
			firstSecurity = getValuesFrom(rows.first());
			lastSecurity = getValuesFrom(rows.last());
		});
	});

	describe("adding a security", (): void => {
		beforeEach((): void => {
			expected = { name: "Test security", code: "TEST", holding: "0.000", balance: "$0.00" };
			cy.get("body").type("{insert}");
			cy.get(securityEditHeading).should("have.text", "Add Security");
			populateFormWith(expected);
		});

		commonBehaviour();

		it("should insert a new security when the save button is clicked", (): void => {
			cy.get(saveButton).click();
			cy.get(securityEditForm).should("not.be.visible");

			// Row count should have incremented by one
			cy.get(securitiesTableRows).should("have.length", originalRowCount + 1);

			// Security in the last row should be the new security
			cy.get(securitiesTableRows).last().within((): void => checkRowMatches(expected, true));
		});
	});

	describe("editing a security", (): void => {
		beforeEach((): void => {
			expected = { name: "Test security (edited)", code: "TEST2", holding: "2.000", balance: "$2.00" };
			cy.get(securitiesTableRows).eq(0).click();
			cy.get("body").type("{ctrl}e");
			cy.get(securityEditHeading).should("have.text", "Edit Security");
			checkFormMatches(firstSecurity);
			populateFormWith(expected);
		});

		commonBehaviour();

		it("should update an existing security when the save button is clicked", (): void => {
			cy.get(saveButton).click();
			cy.get(securityEditForm).should("not.be.visible");

			// Row count should not have changed
			cy.get(securitiesTableRows).should("have.length", originalRowCount);

			// Security in the last row should be the new security
			cy.get(securitiesTableRows).first().within((): void => checkRowMatches(expected));
		});
	});
});