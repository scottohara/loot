const webpackOptions = require("../webpack.config"),
			webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = (on, config) => {
	const { LOOT_USERNAME, LOOT_PASSWORD } = process.env;

	config.env = { ...config.env, LOOT_USERNAME, LOOT_PASSWORD };
	on("file:preprocessor", webpackPreprocessor({ webpackOptions }));

	return config;
};