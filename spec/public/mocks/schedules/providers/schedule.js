(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedulesMocks")
		.provider("scheduleMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock schedule object
		provider.schedule = {
			id: 1,
			transaction_type: "Transfer",
			next_due_date: moment().startOf("day").add(3, "days").toDate(),
			subtransactions: [{}],
			autoFlag: false,
			flag: null
		};

		provider.$get = function() {
			// Return the mock schedule object
			return provider.schedule;
		};
	}
})();
