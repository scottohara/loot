import { DirectiveTestScope } from "mocks/types";

export default class DirectiveTest {
	public scope!: DirectiveTestScope;

	private directive!: string;

	private tagName!: string;

	private content!: string;

	private container!: string;

	private element!: JQuery<Element>;

	public constructor(private readonly $rootScope: angular.IRootScopeService, private readonly $compile: angular.ICompileService) {}

	// Configures the name of the directive and the element tag (and optionally, any contents)
	public configure(directive: string, tagName = "div", content = ""): void {
		this.directive = directive;
		this.tagName = tagName;
		this.content = content;

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
	public compile(options: {[option: string]: string | undefined;} = {}, replace = false): void {
		// Configure the directive with any passed options
		let directive = `${this.directive}${undefined === Object.getOwnPropertyDescriptor(options, this.directive) ? "" : `="${options[this.directive]}"`}`;

		directive = Object.keys(options).reduce((memo: string, option: string): string => {
			if (option !== this.directive) {
				return `${memo} ${option}${undefined === options[option] ? "" : `="${options[option]}"`}`;
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