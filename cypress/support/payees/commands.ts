Cypress.Commands.add("createPayees", (): void => {
	cy.exec("bundle exec rake db:e2e:payees");
});
