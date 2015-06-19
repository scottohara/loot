{
	/**
	 * Implementation
	 */
	class Directive {
		constructor() {
			return {
				restrict: "A",
				scope: {
					message: "=ogLoadingSpinner"
				},
				templateUrl: "og-components/og-loading-spinner/views/loading.html",
				link: scope => scope.loadingMessage = scope.message || "Loading"
			};
		}

		static factory() {
			return new Directive();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogLoadingSpinner", Directive.factory);

	/**
	 * Dependencies
	 */
	Directive.factory.$inject = [];
}
