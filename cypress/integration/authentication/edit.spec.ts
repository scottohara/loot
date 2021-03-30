import {
	cancelButton,
	errorMessage,
	loginButton,
	loginForm,
	notLoggedInMessage,
	populateFormWith
} from "authentication/edit";

describe("Authentication Edit", (): void => {
	beforeEach((): void => {
		cy.visit("/");

		// Need to wait for the modal to finish animating, otherwise we sometimes miss the first character typed
		cy.wait(300);
	});

	it("should login if the credentials are valid", (): void => {
		populateFormWith(Cypress.env("LOOT_USERNAME"), Cypress.env("LOOT_PASSWORD"));
		cy.get(loginButton).click();
		cy.contains(errorMessage).should("not.exist");
		cy.contains(notLoggedInMessage).should("not.exist");
		cy.get(loginForm).should("not.exist");
	});

	it("should not login if the credentials are invalid", (): void => {
		populateFormWith("baduser", "badpassword");
		cy.get(loginButton).click();
		cy.contains(errorMessage).should("be.visible");
		cy.get(loginForm).should("be.visible");
	});

	it("should not login when the cancel button is clicked", (): void => {
		cy.get(cancelButton).click();
		cy.contains(notLoggedInMessage).should("be.visible");
		cy.get(loginForm).should("not.exist");
	});
});
