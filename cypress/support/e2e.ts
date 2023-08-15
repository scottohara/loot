import "~/support/accounts/commands";
import "~/support/authentication/commands";
import "~/support/categories/commands";
import "~/support/payees/commands";
import "~/support/schedules/commands";
import "~/support/securities/commands";
import "~/support/transactions/commands";

// Helper command for working with typeaheads
Cypress.Commands.add("typeahead", (typeahead: string, searchText: string): void => {
	cy.get(typeahead).clear().type(searchText);
	cy.get(`${typeahead} + ul.dropdown-menu > li.uib-typeahead-match`).should("contain.text", searchText);
	cy.get(typeahead).type("{enter}");
});