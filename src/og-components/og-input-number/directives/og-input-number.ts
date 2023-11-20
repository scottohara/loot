import type { OgInputNumberScope } from "~/og-components/og-input-number/types";

export default class OgInputNumberDirective {
	public constructor(numberFilter: angular.IFilterNumber) {
		const directive: angular.IDirective = {
			restrict: "A",
			priority: 1,
			require: "ngModel",
			scope: {
				precision: "@ogInputNumber",
			},
			controller: "OgInputNumberController",
			controllerAs: "vm",
			bindToController: true,
			link(
				scope: OgInputNumberScope,
				iElement: JQuery<Element>,
				_: angular.IAttributes,
				ngModel: angular.INgModelController,
			): void {
				// Set the decimal places
				if (scope.vm.precision) {
					scope.vm.decimalPlaces = Number(scope.vm.precision);
				}

				// View to model
				ngModel.$parsers.push(scope.vm.formattedToRaw.bind(scope.vm));

				// Model to view
				ngModel.$formatters.unshift(scope.vm.rawToFormatted.bind(scope.vm));

				function formattedToRaw(): void {
					iElement.val(
						numberFilter(
							scope.vm.formattedToRaw(String(iElement.val())),
							scope.vm.decimalPlaces,
						),
					);
				}

				// Update view when tabbing in/out of the field
				iElement.on("focus", formattedToRaw);
				iElement.on("blur", formattedToRaw);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): void => {
					iElement.off("focus", formattedToRaw);
					iElement.off("blur", formattedToRaw);
				});
			},
		};

		return directive;
	}

	public static factory(
		numberFilter: angular.IFilterNumber,
	): OgInputNumberDirective {
		return new OgInputNumberDirective(numberFilter);
	}
}

OgInputNumberDirective.factory.$inject = ["numberFilter"];
