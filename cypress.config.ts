import { defineConfig } from "cypress";

export default defineConfig({
	viewportHeight: 800,
	viewportWidth: 1200,
	chromeWebSecurity: false,
	defaultBrowser: "chrome",
	e2e: {
		setupNodeEvents(
			_on: Cypress.PluginEvents,
			config: Cypress.PluginConfigOptions,
		): Cypress.PluginConfigOptions {
			const { LOOT_USERNAME, LOOT_PASSWORD } = process.env;

			config.env = { ...config.env, LOOT_USERNAME, LOOT_PASSWORD };

			return config;
		},
		baseUrl: "http://localhost:3000",
		experimentalRunAllSpecs: true,
	},
});
