{
	/**
	 * Implementation
	 */
	class ScheduleMockProvider {
		constructor() {
			// Mock schedule object
			this.schedule = {
				id: 1,
				transaction_type: "Transfer",
				next_due_date: moment().startOf("day").add(3, "days").toDate(),
				subtransactions: [{}],
				autoFlag: false,
				flag: null
			};
		}

		$get() {
			// Return the mock schedule object
			return this.schedule;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSchedulesMocks")
		.provider("scheduleMock", ScheduleMockProvider);

	/**
	 * Dependencies
	 */
	ScheduleMockProvider.$inject = [];
}
