Cypress.Commands.add("createTransactions", (): void => {
	cy.exec("bundle exec rake db:e2e:transactions");
});
