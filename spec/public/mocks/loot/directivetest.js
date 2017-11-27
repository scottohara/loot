export default class DirectiveTest {
	constructor($rootScope, $compile) {
		this.$rootScope = $rootScope;
		this.$compile = $compile;
	}

	// Configures the name of the directive and the element tag (and optionally, any contents)
	configure(directive, tagName, content) {
		this.directive = directive;
		this.tagName = tagName || "div";
		this.content = content || "";

		switch (tagName) {
			case "tr":
			case "td":
			case "th":
			case "thead":
			case "tbody":
			case "tfoot":
				this.container = "table";
				break;

			default:
				this.container = "div";
		}

		// Create a new scope
		this.scope = this.$rootScope.$new();
	}

	/*
	 * Compiles the directive and returns an array containing
	 * - the DOM element into which the directive was compiled
	 * - the scope object that it was compiled with
	 */
	compile(options = {}, replace) {
		let directive;

		// Configure the directive with any passed options
		directive = `${this.directive}${Object.getOwnPropertyDescriptor(options, this.directive) ? `="${options[this.directive]}"` : ""}`;
		directive = Object.keys(options).reduce((memo, option) => {
			if (option !== this.directive) {
				return `${memo} ${option}="${options[option]}"`;
			}

			return memo;
		}, directive);

		// Compile the directive into the specified element tag using the new scope
		this.element = this.$compile(`<${this.container}>
																		<${this.tagName} ng-model="model" ${directive}>
																			${this.content}
																		</${this.tagName}>
																	</${this.container}>`)(this.scope);

		// Unless the element is to be replaced, find the element within the compiled directive
		if (!replace) {
			this.element = this.element.find(this.tagName);
		}
	}
}

DirectiveTest.$inject = ["$rootScope", "$compile"];