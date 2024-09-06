import oharagroup from "eslint-config-oharagroup";
import tseslint from "typescript-eslint";

export default tseslint.config(
	...oharagroup.ts,
	{
		name: "loot/base",
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["*.?(m|c)js", "src/index.test.js"],
					maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 10,
				},
			},
		},
		rules: {
			// Disabled for camelcase in Typescript interfaces
			camelcase: "off",
			// Disabled due to too many any types in 3rd party dependencies
			"@typescript-eslint/no-unsafe-call": "off",
			// Disabled due to too many any types in 3rd party dependencies
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
	{
		name: "loot/tests",
		files: ["**/*.test.ts", "**/mocks/**/*"],
		rules: {
			// Disable for readability of test fixtures (eg. categories)
			"object-property-newline": "off",
			// Disable to allow Chai-as-promised assertions
			"@typescript-eslint/no-floating-promises": "off",
			// Disable to allow Chai assertions (e.g. `expect(..).to.have.been.called`)
			"@typescript-eslint/no-unused-expressions": "off",
		},
	},
);
