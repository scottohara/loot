import "~/og-components/og-table-loading/css/og-table-loading.less";
import OgTableLoadingView from "~/og-components/og-table-loading/views/loading.html";

export default class OgTableLoadingDirective {
	public constructor() {
		const directive: angular.IDirective = {
			restrict: "A",
			replace: true,
			scope: {
				isLoading: "=ogTableLoading",
				colspan: "@",
			},
			templateUrl: OgTableLoadingView,
		};

		return directive;
	}

	public static factory(): OgTableLoadingDirective {
		return new OgTableLoadingDirective();
	}
}

OgTableLoadingDirective.factory.$inject = [];
