import {addDays, startOfDay} from "date-fns/esm";

export default class ScheduleMockProvider {
	constructor() {
		// Mock schedule object
		this.schedule = {
			id: 1,
			transaction_type: "Transfer",
			next_due_date: addDays(startOfDay(new Date()), 3),
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

ScheduleMockProvider.$inject = [];