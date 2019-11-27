Cypress.Commands.add("createSecurities", (): void => {
	cy.exec("bundle exec rake db:e2e:securities");
});