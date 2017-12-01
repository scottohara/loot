import {OgInputNumberScope} from "og-components/og-input-number/types";

export default class OgInputNumberDirective {
	public constructor(numberFilter: angular.IFilterNumber) {
		return {
			restrict: "A",
			priority: 1,
			require: "ngModel",
			scope: {},
			controller: "OgInputNumberController",
			controllerAs: "vm",
			bindToController: true,
			link(scope: OgInputNumberScope, iElement: JQuery<Element>, _: angular.IAttributes, ngModel: angular.INgModelController): void {
				// View to model
				ngModel.$parsers.push(scope.vm.formattedToRaw);

				// Model to view
				ngModel.$formatters.unshift((value: number): string => numberFilter((Boolean(value) && Number(value)) || 0));

				function formattedToRaw(): void {
					iElement.val(numberFilter(scope.vm.formattedToRaw(String(iElement.val()))));
				}

				// Update view when tabbing in/out of the field
				iElement.on("focus", formattedToRaw);
				iElement.on("blur", formattedToRaw);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): void => {
					iElement.off("focus", formattedToRaw);
					iElement.off("blur", formattedToRaw);
				});
			}
		} as angular.IDirective;
	}

	public static factory(numberFilter: angular.IFilterNumber): OgInputNumberDirective {
		return new OgInputNumberDirective(numberFilter);
	}
}

OgInputNumberDirective.factory.$inject = ["numberFilter"];