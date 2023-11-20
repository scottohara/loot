export default class OgViewScrollService {
	public constructor(
		private readonly $anchorScroll: angular.IAnchorScrollService,
	) {}

	public scrollTo(anchor: "bottom" | "top"): void {
		this.$anchorScroll(anchor);
	}
}

OgViewScrollService.$inject = ["$anchorScroll"];
