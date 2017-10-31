export default class OgViewScrollService {
	constructor($anchorScroll) {
		this.$anchorScroll = $anchorScroll;
	}

	scrollTo(anchor) {
		this.$anchorScroll(anchor);
	}
}

OgViewScrollService.$inject = ["$anchorScroll"];