import "../css/og-favourite.less";
import OgFavouriteView from "og-components/og-favourite/views/favourite.html";

export default class OgFavouriteDirective {
	constructor() {
		return {
			restrict: "A",
			replace: true,
			scope: {
				favourite: "=ogFavourite"
			},
			templateUrl: OgFavouriteView
		};
	}

	static factory() {
		return new OgFavouriteDirective();
	}
}

OgFavouriteDirective.factory.$inject = [];