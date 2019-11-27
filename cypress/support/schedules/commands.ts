Cypress.Commands.add("createSchedules", (): void => {
	cy.exec("bundle exec rake db:e2e:schedules");
});