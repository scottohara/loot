Cypress.Commands.add(
	"createAccounts",
	(): Cypress.Chainable => cy.task("createData", "accounts"),
);
