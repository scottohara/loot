{
	/**
	 * Implementation
	 */
	class OgFavouriteDirective {
		constructor() {
			return {
				restrict: "A",
				replace: true,
				scope: {
					favourite: "=ogFavourite"
				},
				templateUrl: "og-components/og-favourite/views/favourite.html"
			};
		}

		static factory() {
			return new OgFavouriteDirective();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogFavourite", OgFavouriteDirective.factory);

	/**
	 * Dependencies
	 */
	OgFavouriteDirective.factory.$inject = [];
}
