import "../css/og-table-loading.less";
import OgTableLoadingView from "og-components/og-table-loading/views/loading.html";

export default class OgTableLoadingDirective {
	public constructor() {
		return {
			restrict: "A",
			replace: true,
			scope: {
				isLoading: "=ogTableLoading",
				colspan: "@"
			},
			templateUrl: OgTableLoadingView
		} as angular.IDirective;
	}

	public static factory(): OgTableLoadingDirective {
		return new OgTableLoadingDirective();
	}
}

OgTableLoadingDirective.factory.$inject = [];