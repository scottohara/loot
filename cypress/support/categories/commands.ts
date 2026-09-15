Cypress.Commands.add(
	"createCategories",
	(): Cypress.Chainable => cy.task("createData", "categories"),
);
