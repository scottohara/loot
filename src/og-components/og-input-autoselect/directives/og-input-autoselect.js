{
	/**
	 * Implementation
	 */
	class Directive {
		constructor($timeout) {
			return {
				restrict: "A",
				link: (scope, iElement) => {
					function select() {
						$timeout(() => $(iElement).select());
					}

					// Select the input value on focus
					iElement.on("focus", select);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", () => iElement.off("focus", select));
				}
			};
		}

		static factory($timeout) {
			return new Directive($timeout);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogInputAutoselect", Directive.factory);

	/**
	 * Dependencies
	 */
	Directive.factory.$inject = ["$timeout"];
}
