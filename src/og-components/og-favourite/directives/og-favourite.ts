import "../css/og-favourite.less";
import OgFavouriteView from "og-components/og-favourite/views/favourite.html";

export default class OgFavouriteDirective {
	public constructor() {
		return {
			restrict: "A",
			replace: true,
			scope: {
				favourite: "=ogFavourite"
			},
			templateUrl: OgFavouriteView
		} as angular.IDirective;
	}

	public static factory(): OgFavouriteDirective {
		return new OgFavouriteDirective();
	}
}

OgFavouriteDirective.factory.$inject = [];