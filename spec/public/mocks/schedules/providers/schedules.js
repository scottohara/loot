import moment from "moment";

export default class SchedulesMockProvider {
	constructor() {
		// Mock schedules object
		this.schedules = [
			{id: 1, next_due_date: moment().startOf("day").subtract(9, "days").toDate()},
			{id: 2, next_due_date: moment().startOf("day").subtract(8, "days").toDate()},
			{id: 3, next_due_date: moment().startOf("day").subtract(7, "days").toDate()},
			{id: 4, next_due_date: moment().startOf("day").subtract(6, "days").toDate()},
			{id: 5, next_due_date: moment().startOf("day").subtract(5, "days").toDate()},
			{id: 6, next_due_date: moment().startOf("day").subtract(4, "days").toDate()},
			{id: 7, next_due_date: moment().startOf("day").subtract(3, "days").toDate()},
			{id: 8, next_due_date: moment().startOf("day").subtract(2, "days").toDate()},
			{id: 9, next_due_date: moment().startOf("day").subtract(1, "day").toDate()}
		];
	}

	$get() {
		// Return the mock schedules object
		return this.schedules;
	}
}

SchedulesMockProvider.$inject = [];