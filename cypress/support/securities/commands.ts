Cypress.Commands.add(
	"createSecurities",
	(): Cypress.Chainable => cy.task("createData", "securities"),
);
