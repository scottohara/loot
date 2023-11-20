import "~/og-components/og-favourite/css/og-favourite.less";
import OgFavouriteView from "~/og-components/og-favourite/views/favourite.html";

export default class OgFavouriteDirective {
	public constructor() {
		const directive: angular.IDirective = {
			restrict: "A",
			replace: true,
			scope: {
				favourite: "=ogFavourite",
			},
			templateUrl: OgFavouriteView,
		};

		return directive;
	}

	public static factory(): OgFavouriteDirective {
		return new OgFavouriteDirective();
	}
}

OgFavouriteDirective.factory.$inject = [];
