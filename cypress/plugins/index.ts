export default function(_on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.ConfigOptions {
	const { LOOT_USERNAME, LOOT_PASSWORD } = process.env;

	config.env = { ...config.env, LOOT_USERNAME, LOOT_PASSWORD };

	return config;
}