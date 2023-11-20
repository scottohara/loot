import "~/og-components/og-loading-spinner/css/og-loading-spinner.less";
import type { OgLoadingSpinnerScope } from "~/og-components/og-loading-spinner/types";
import OgLoadingSpinnerView from "~/og-components/og-loading-spinner/views/loading.html";

export default class OgLoadingSpinnerDirective {
	public constructor() {
		const directive: angular.IDirective = {
			restrict: "A",
			scope: {
				message: "=ogLoadingSpinner",
			},
			templateUrl: OgLoadingSpinnerView,
			link: (scope: OgLoadingSpinnerScope): string =>
				(scope.loadingMessage =
					undefined === scope.message || "" === scope.message
						? "Loading"
						: scope.message),
		};

		return directive;
	}

	public static factory(): OgLoadingSpinnerDirective {
		return new OgLoadingSpinnerDirective();
	}
}

OgLoadingSpinnerDirective.factory.$inject = [];
