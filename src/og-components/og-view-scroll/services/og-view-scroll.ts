export default class OgViewScrollService {
	public constructor(private readonly $anchorScroll: angular.IAnchorScrollService) {}

	public scrollTo(anchor: "top" | "bottom"): void {
		this.$anchorScroll(anchor);
	}
}

OgViewScrollService.$inject = ["$anchorScroll"];