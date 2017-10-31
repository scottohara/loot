export default class OgInputAutoSelectDirective {
	constructor($window, $timeout) {
		return {
			restrict: "A",
			link(scope, iElement) {
				scope.isFocussed = input => input === document.activeElement;

				function select() {
					// Select the value only if the element still has focus
					$timeout(() => scope.isFocussed(iElement[0]) && $window.$(iElement).select());
				}

				// Select the input value on focus
				iElement.on("focus", select);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", () => iElement.off("focus", select));
			}
		};
	}

	static factory($window, $timeout) {
		return new OgInputAutoSelectDirective($window, $timeout);
	}
}

OgInputAutoSelectDirective.factory.$inject = ["$window", "$timeout"];