import "../css/og-loading-spinner.less";
import {OgLoadingSpinnerScope} from "og-components/og-loading-spinner/types";
import OgLoadingSpinnerView from "og-components/og-loading-spinner/views/loading.html";

export default class OgLoadingSpinnerDirective {
	public constructor() {
		return {
			restrict: "A",
			scope: {
				message: "=ogLoadingSpinner"
			},
			templateUrl: OgLoadingSpinnerView,
			link: (scope: OgLoadingSpinnerScope): string => (scope.loadingMessage = scope.message || "Loading")
		} as angular.IDirective;
	}

	public static factory(): OgLoadingSpinnerDirective {
		return new OgLoadingSpinnerDirective();
	}
}

OgLoadingSpinnerDirective.factory.$inject = [];