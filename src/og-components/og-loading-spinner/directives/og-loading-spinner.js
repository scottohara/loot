{
	/**
	 * Implementation
	 */
	class OgLoadingSpinnerDirective {
		constructor() {
			return {
				restrict: "A",
				scope: {
					message: "=ogLoadingSpinner"
				},
				templateUrl: "og-components/og-loading-spinner/views/loading.html",
				link: scope => (scope.loadingMessage = scope.message || "Loading")
			};
		}

		static factory() {
			return new OgLoadingSpinnerDirective();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogLoadingSpinner", OgLoadingSpinnerDirective.factory);

	/**
	 * Dependencies
	 */
	OgLoadingSpinnerDirective.factory.$inject = [];
}
