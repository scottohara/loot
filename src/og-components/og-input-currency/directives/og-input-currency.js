export default class OgInputCurrencyDirective {
	constructor(numberFilter) {
		return {
			restrict: "A",
			priority: 1,
			require: "ngModel",
			scope: {
				precision: "@ogInputCurrency"
			},
			controller: "OgInputCurrencyController",
			controllerAs: "vm",
			bindToController: true,
			link(scope, iElement, iAttrs, ngModel) {
				// Set the decimal places
				scope.vm.setDecimalPlaces(scope.vm.precision);

				// View to model
				ngModel.$parsers.push(scope.vm.formattedToRaw);

				// Model to view
				ngModel.$formatters.unshift(scope.vm.rawToFormatted.bind(scope.vm));

				function formattedToRaw() {
					iElement.val(numberFilter(scope.vm.formattedToRaw(iElement.val()), scope.vm.decimalPlaces));
				}

				function rawToFormatted() {
					iElement.val(scope.vm.rawToFormatted(scope.vm.formattedToRaw(iElement.val())));
				}

				// Update view when tabbing in/out of the field
				iElement.on("focus", formattedToRaw);
				iElement.on("blur", rawToFormatted);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", () => {
					iElement.off("focus", formattedToRaw);
					iElement.off("blur", rawToFormatted);
				});
			}
		};
	}

	static factory(numberFilter) {
		return new OgInputCurrencyDirective(numberFilter);
	}
}

OgInputCurrencyDirective.factory.$inject = ["numberFilter"];