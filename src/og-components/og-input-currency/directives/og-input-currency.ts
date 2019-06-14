import {OgInputCurrencyScope} from "og-components/og-input-currency/types";

export default class OgInputCurrencyDirective {
	public constructor(numberFilter: angular.IFilterNumber) {
		const directive: angular.IDirective = {
			restrict: "A",
			priority: 1,
			require: "ngModel",
			scope: {
				precision: "@ogInputCurrency"
			},
			controller: "OgInputCurrencyController",
			controllerAs: "vm",
			bindToController: true,
			link(scope: OgInputCurrencyScope, iElement: JQuery<Element>, _: angular.IAttributes, ngModel: angular.INgModelController): void {
				// Set the decimal places
				scope.vm.decimalPlaces = scope.vm.precision;

				// View to model
				ngModel.$parsers.push(scope.vm.formattedToRaw.bind(scope.vm));

				// Model to view
				ngModel.$formatters.unshift(scope.vm.rawToFormatted.bind(scope.vm));

				function formattedToRaw(): void {
					iElement.val(numberFilter(scope.vm.formattedToRaw(String(iElement.val())), scope.vm.decimalPlaces));
				}

				function rawToFormatted(): void {
					iElement.val(scope.vm.rawToFormatted(scope.vm.formattedToRaw(String(iElement.val()))));
				}

				// Update view when tabbing in/out of the field
				iElement.on("focus", formattedToRaw);
				iElement.on("blur", rawToFormatted);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): void => {
					iElement.off("focus", formattedToRaw);
					iElement.off("blur", rawToFormatted);
				});
			}
		};

		return directive;
	}

	public static factory(numberFilter: angular.IFilterNumber): OgInputCurrencyDirective {
		return new OgInputCurrencyDirective(numberFilter);
	}
}

OgInputCurrencyDirective.factory.$inject = ["numberFilter"];