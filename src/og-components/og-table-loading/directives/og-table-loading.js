{
	/**
	 * Implementation
	 */
	class Directive {
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
			return new Directive();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogTableLoading", Directive.factory);

	/**
	 * Dependencies
	 */
	Directive.factory.$inject = [];
}
