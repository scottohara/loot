import "accounts/commands";
import "authentication/commands";
import "categories/commands";
import "payees/commands";
import "schedules/commands";
import "securities/commands";
import "transactions/commands";

// Clear the login state
beforeEach((): Cypress.Chainable<Window> => cy.window().then((win: Window): void => win.sessionStorage.clear()));

// Helper command for working with typeaheads
Cypress.Commands.add("typeahead", (typeahead: string, searchText: string): void => {
	cy.get(typeahead).clear().type(searchText);
	cy.get(`${typeahead} + ul.dropdown-menu > li.uib-typeahead-match`).should("contain.text", searchText);
	cy.get(typeahead).type("{enter}");
});