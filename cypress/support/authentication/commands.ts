Cypress.Commands.add(
	"login",
	(): Cypress.Chainable =>
		cy.env(["LOOT_USERNAME", "LOOT_PASSWORD"]).then(
			({
				LOOT_USERNAME,
				LOOT_PASSWORD,
			}: Record<string, string>): Cypress.Chainable =>
				cy.window().then((window: Window): void => {
					const authenticationKey: string = window.btoa(
						`${LOOT_USERNAME}:${LOOT_PASSWORD}`,
					);

					window.sessionStorage.setItem(
						"lootAuthenticationKey",
						authenticationKey,
					);
				}),
		),
);
