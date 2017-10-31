import "../css/og-loading-spinner.less";
import OgLoadingSpinnerView from "og-components/og-loading-spinner/views/loading.html";

export default class OgLoadingSpinnerDirective {
	constructor() {
		return {
			restrict: "A",
			scope: {
				message: "=ogLoadingSpinner"
			},
			templateUrl: OgLoadingSpinnerView,
			link: scope => (scope.loadingMessage = scope.message || "Loading")
		};
	}

	static factory() {
		return new OgLoadingSpinnerDirective();
	}
}

OgLoadingSpinnerDirective.factory.$inject = [];