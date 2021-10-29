import type {
	Action,
	OgTableNavigable
} from "./types";

export function testNavigableTable({ rows, actions }: OgTableNavigable): void {
	describe("table navigation", (): void => {
		let targetRow: number,
				totalRows: number;

		beforeEach((): Cypress.Chainable<number> => cy.get(rows).then((tableRows: JQuery<HTMLTableRowElement>): number => (totalRows = tableRows.length)));

		describe("forward", (): void => {
			beforeEach((): void => {
				cy.get(rows).eq(0).click();

				// Wait for the click, otherwise we sometimes get an aborted state transition
				cy.wait(200);
			});

			it("should focus the first row", (): number => (targetRow = 0));

			describe("by one row", (): void => {
				beforeEach((): number => (targetRow = 1));

				it("should move the focus down by one row when the 'J' key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("j"));
				it("should move the focus down by one row when the arrow down key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{downarrow}"));
			});

			describe("by ten rows", (): void => {
				beforeEach((): number => (targetRow = totalRows > 10 ? 10 : totalRows - 1));

				it("should move the focus down by ten rows when the page down key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{pagedown}"));
			});
		});

		describe("backward", (): void => {
			beforeEach((): void => {
				cy.get(rows).eq(totalRows - 1).click();

				// Wait for the click, otherwise we sometimes get an aborted state transition
				cy.wait(200);
			});

			it("should focus the last row", (): number => (targetRow = totalRows - 1));

			describe("by one row", (): void => {
				beforeEach((): number => (targetRow = totalRows - 2));

				it("should move the focus up by one row when the 'K' key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("k"));
				it("should move the focus up by one row when the arrow up key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{uparrow}"));
			});

			describe("by ten rows", (): void => {
				beforeEach((): number => (targetRow = totalRows > 10 ? totalRows - 11 : 0));

				it("should move the focus up by ten rows when the page up key is pressed", (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{pageup}"));
			});
		});

		afterEach((): void => {
			// There should only be one focussed row
			cy.get(rows).filter(".warning").should("have.length", 1);

			// The target row should be the focussed row
			cy.get(rows).eq(targetRow).should("have.class", "warning");
		});
	});

	describe("table actions", (): void => {
		let action: Action;

		beforeEach((): Cypress.Chainable<JQuery> => cy.get(rows).last().click());

		describe("insert", (): void => {
			const { headingText } = actions.insert;

			beforeEach((): Action => (action = "insert"));

			it(`should display the ${headingText} view when the insert key is pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{insert}"));
			it(`should display the ${headingText} view when the CTRL+N keys are pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{ctrl}n"));
		});

		describe("edit", (): void => {
			const { headingText, mouseAction } = actions.edit;

			beforeEach((): Action => (action = "edit"));

			if (undefined !== mouseAction) {
				it(`should display the ${headingText} view when the ${mouseAction.name}`, (): void => mouseAction.perform(0));
			}

			it(`should display the ${headingText} view when the CTRL+E keys are pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{ctrl}e"));
		});

		describe("delete", (): void => {
			const { headingText } = actions.del;

			beforeEach((): Action => (action = "del"));

			it(`should display the ${headingText} view when the delete key is pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{del}"));
			it(`should display the ${headingText} view when the backspace key is pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{backspace}"));
		});

		describe("select", (): void => {
			const { headingText, headingText2 } = actions.select;

			beforeEach((): Action => (action = "select"));

			it(`should display the ${headingText}${headingText2 ?? ""} view when a row is double clicked`, (): Cypress.Chainable<JQuery> => cy.get(rows).eq(0).dblclick());
			it(`should display the ${headingText}${headingText2 ?? ""} view when the enter key is pressed`, (): Cypress.Chainable<JQuery<HTMLBodyElement>> => cy.get("body").type("{enter}"));
		});

		afterEach((): void => {
			const { view, heading, headingText, url } = actions[action];

			// The corresponding view should be displayed
			cy.get(view).should("be.visible");

			// The corresponding view heading should be displayed
			cy.get(heading).should("have.text", headingText);

			// If a URL was specified, the location hash should match
			if (undefined !== url) {
				cy.location("hash").should("match", url);
			}
		});
	});
}