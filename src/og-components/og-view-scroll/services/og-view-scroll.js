{
	/**
	 * Implementation
	 */
	class Service {
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
		.service("ogViewScrollService", Service);

	/**
	 * Dependencies
	 */
	Service.$inject = ["$anchorScroll"];
}
