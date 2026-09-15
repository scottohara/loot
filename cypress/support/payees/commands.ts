Cypress.Commands.add(
	"createPayees",
	(): Cypress.Chainable => cy.task("createData", "payees"),
);
