{
	/**
	 * Implementation
	 */
	class OgViewScrollService {
		constructor($anchorScroll) {
			this.$anchorScroll = $anchorScroll;
		}

		scrollTo(anchor) {
			this.$anchorScroll(anchor);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.service("ogViewScrollService", OgViewScrollService);

	/**
	 * Dependencies
	 */
	OgViewScrollService.$inject = ["$anchorScroll"];
}
