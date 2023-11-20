Cypress.Commands.add("login", (): void => {
	cy.window().then((window: Window): void => {
		const authenticationKey: string = window.btoa(
			`${String(Cypress.env("LOOT_USERNAME"))}:${String(
				Cypress.env("LOOT_PASSWORD"),
			)}`,
		);

		window.sessionStorage.setItem("lootAuthenticationKey", authenticationKey);
	});
});
