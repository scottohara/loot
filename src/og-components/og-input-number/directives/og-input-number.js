{
	/**
	 * Implementation
	 */
	class OgInputNumberDirective {
		constructor(numberFilter) {
			return {
				restrict: "A",
				priority: 1,
				require: "ngModel",
				scope: {},
				controller: "OgInputNumberController",
				controllerAs: "vm",
				bindToController: true,
				link: (scope, iElement, iAttrs, ngModel) => {
					// View to model
					ngModel.$parsers.push(scope.vm.formattedToRaw);

					// Model to view
					ngModel.$formatters.unshift(value => numberFilter((Boolean(value) && Number(value)) || 0));

					function formattedToRaw() {
						iElement.val(numberFilter(scope.vm.formattedToRaw(iElement.val())));
					}

					// Update view when tabbing in/out of the field
					iElement.on("focus", formattedToRaw);
					iElement.on("blur", formattedToRaw);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", () => {
						iElement.off("focus", formattedToRaw);
						iElement.off("blur", formattedToRaw);
					});
				}
			};
		}

		static factory(numberFilter) {
			return new OgInputNumberDirective(numberFilter);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogInputNumber", OgInputNumberDirective.factory);

	/**
	 * Dependencies
	 */
	OgInputNumberDirective.factory.$inject = ["numberFilter"];
}
