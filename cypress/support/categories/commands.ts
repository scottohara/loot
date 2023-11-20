Cypress.Commands.add("createCategories", (): void => {
	cy.exec("bundle exec rake db:e2e:categories");
});
