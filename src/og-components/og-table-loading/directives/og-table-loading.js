{
	/**
	 * Implementation
	 */
	class OgTableLoadingDirective {
		constructor() {
			return {
				restrict: "A",
				replace: true,
				scope: {
					isLoading: "=ogTableLoading",
					colspan: "@"
				},
				templateUrl: "og-components/og-table-loading/views/loading.html"
			};
		}

		static factory() {
			return new OgTableLoadingDirective();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogTableLoading", OgTableLoadingDirective.factory);

	/**
	 * Dependencies
	 */
	OgTableLoadingDirective.factory.$inject = [];
}
