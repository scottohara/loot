import { OgInputAutoSelectScope } from "og-components/og-input-autoselect/types";

export default class OgInputAutoSelectDirective {
	public constructor($window: angular.IWindowService, $timeout: angular.ITimeoutService) {
		const directive: angular.IDirective = {
			restrict: "A",
			link(scope: OgInputAutoSelectScope, iElement: JQuery<Element>): void {
				scope.isFocussed = (input?: Element): boolean => input === document.activeElement;

				function select(): void {
					// Select the value only if the element still has focus
					$timeout((): void => scope.isFocussed(iElement[0]) && $window.$(iElement).select());
				}

				// Select the input value on focus
				iElement.on("focus", select);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): JQuery<Element> => iElement.off("focus", select));
			}
		};

		return directive;
	}

	public static factory($window: angular.IWindowService, $timeout: angular.ITimeoutService): OgInputAutoSelectDirective {
		return new OgInputAutoSelectDirective($window, $timeout);
	}
}

OgInputAutoSelectDirective.factory.$inject = ["$window", "$timeout"];