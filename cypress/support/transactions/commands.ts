Cypress.Commands.add(
	"createTransactions",
	(): Cypress.Chainable => cy.task("createData", "transactions"),
);
