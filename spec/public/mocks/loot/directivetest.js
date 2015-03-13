(function () {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootMocks")
		.factory("directiveTest", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$rootScope", "$compile"];

	/**
	 * Implementation
	 */
	function Factory($rootScope, $compile) {
		var helper = {};

		// Configures the name of the directive and the element tag (and optionally, any contents)
		helper.configure = function(directive, tagName, content) {
			helper.directive = directive;
			helper.tagName = tagName || "div";
			helper.content = content || "";

			switch (tagName) {
				case "tr":
				case "td":
				case "th":
				case "thead":
				case "tbody":
				case "tfoot":
					helper.container = "table";
					break;

				default:
					helper.container = "div";
			}

			// Create a new scope
			helper.scope = $rootScope.$new();
		};

		// Compiles the directive and returns an array containing
		// - the DOM element into which the directive was compiled
		// - the scope object that it was compiled with
		helper.compile = function(options, replace) {
			var directive;

			options = options || {};

			// Configure the directive with any passed options
			directive = helper.directive + (options.hasOwnProperty(helper.directive) ? "=\"" + options[helper.directive] + "\"" : "");
			directive = Object.keys(options).reduce(function(memo, option) {
				if (option !== helper.directive) {
					memo += " " + option + "=\"" + options[option] + "\"";
				}
				return memo;
			}, directive);

			// Compile the directive into the specified element tag using the new scope
			helper.element = $compile("<" + helper.container + "><" + helper.tagName + " ng-model=\"model\" " + directive + ">" + helper.content + "</" + helper.tagName + "></" + helper.container + ">")(helper.scope);

			// Unless the element is to be replaced, find the element within the compiled directive
			if (!replace) {
				helper.element = helper.element.find(helper.tagName);
			}
		};

		return helper;
	}
})();
