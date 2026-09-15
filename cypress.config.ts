import { defineConfig } from "cypress";
import { execFileSync } from "node:child_process";

export default defineConfig({
	viewportHeight: 800,
	viewportWidth: 1200,
	chromeWebSecurity: false,
	defaultBrowser: "chrome",
	e2e: {
		setupNodeEvents(
			on: Cypress.PluginEvents,
			config: Cypress.PluginConfigOptions,
		): Cypress.PluginConfigOptions {
			on("task", {
				createData(name: string): Buffer | string {
					return execFileSync("bundle", ["exec", "rake", `db:e2e:${name}`]);
				},
			});

			const { LOOT_USERNAME, LOOT_PASSWORD } = process.env;

			config.env = { ...config.env, LOOT_USERNAME, LOOT_PASSWORD };

			return config;
		},
		baseUrl: "http://localhost:3000",
		experimentalRunAllSpecs: true,
	},
});
