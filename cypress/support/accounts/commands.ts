Cypress.Commands.add("createAccounts", (): void => {
	cy.exec("bundle exec rake db:e2e:accounts");
});
