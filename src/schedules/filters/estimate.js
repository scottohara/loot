{
	/**
	 * Implementation
	 */
	class Filter {
		constructor() {
			return (value, isEstimate) => `${isEstimate ? "~" : ""}${value}`;
		}

		static factory() {
			return new Filter();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.filter("estimate", Filter.factory);

	/**
	 * Dependencies
	 */
	Filter.factory.$inject = [];
}
