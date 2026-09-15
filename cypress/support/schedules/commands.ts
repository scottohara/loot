Cypress.Commands.add(
	"createSchedules",
	(): Cypress.Chainable => cy.task("createData", "schedules"),
);
