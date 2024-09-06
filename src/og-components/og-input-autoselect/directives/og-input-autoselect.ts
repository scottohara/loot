import type { OgInputAutoSelectScope } from "~/og-components/og-input-autoselect/types";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";

export default class OgInputAutoSelectDirective {
	public constructor(
		$window: angular.IWindowService,
		$timeout: angular.ITimeoutService,
		ogModalErrorService: OgModalErrorService,
	) {
		const showError: (message?: unknown) => void =
				ogModalErrorService.showError.bind(ogModalErrorService),
			directive: angular.IDirective = {
				restrict: "A",
				link(scope: OgInputAutoSelectScope, iElement: JQuery<Element>): void {
					scope.isFocussed = (input?: Element): boolean =>
						input === document.activeElement;

					function select(): void {
						// Select the value only if the element still has focus
						$timeout(
							(): unknown =>
								scope.isFocussed(iElement[0]) &&
								($window.$(iElement).select() as unknown),
						).catch(showError);
					}

					// Select the input value on focus
					iElement.on("focus", select);

					// When the element is destroyed, remove all event handlers
					iElement.on(
						"$destroy",
						(): JQuery<Element> => iElement.off("focus", select),
					);
				},
			};

		return directive;
	}

	public static factory(
		$window: angular.IWindowService,
		$timeout: angular.ITimeoutService,
		ogModalErrorService: OgModalErrorService,
	): OgInputAutoSelectDirective {
		return new OgInputAutoSelectDirective(
			$window,
			$timeout,
			ogModalErrorService,
		);
	}
}

OgInputAutoSelectDirective.factory.$inject = [
	"$window",
	"$timeout",
	"ogModalErrorService",
];
