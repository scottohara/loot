import "../css/og-table-loading.less";
import OgTableLoadingView from "og-components/og-table-loading/views/loading.html";

export default class OgTableLoadingDirective {
	constructor() {
		return {
			restrict: "A",
			replace: true,
			scope: {
				isLoading: "=ogTableLoading",
				colspan: "@"
			},
			templateUrl: OgTableLoadingView
		};
	}

	static factory() {
		return new OgTableLoadingDirective();
	}
}

OgTableLoadingDirective.factory.$inject = [];