{
	/**
	 * Implementation
	 */
	class EstimateFilter {
		constructor() {
			return (value, isEstimate) => `${isEstimate ? "~" : ""}${value}`;
		}

		static factory() {
			return new EstimateFilter();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.filter("estimate", EstimateFilter.factory);

	/**
	 * Dependencies
	 */
	EstimateFilter.factory.$inject = [];
}
