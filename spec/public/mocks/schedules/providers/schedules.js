import {startOfDay, subDays} from "date-fns/esm";

export default class SchedulesMockProvider {
	constructor() {
		// Mock schedules object
		this.schedules = [
			{id: 1, next_due_date: subDays(startOfDay(new Date()), 9)},
			{id: 2, next_due_date: subDays(startOfDay(new Date()), 8)},
			{id: 3, next_due_date: subDays(startOfDay(new Date()), 7)},
			{id: 4, next_due_date: subDays(startOfDay(new Date()), 6)},
			{id: 5, next_due_date: subDays(startOfDay(new Date()), 5)},
			{id: 6, next_due_date: subDays(startOfDay(new Date()), 4)},
			{id: 7, next_due_date: subDays(startOfDay(new Date()), 3)},
			{id: 8, next_due_date: subDays(startOfDay(new Date()), 2)},
			{id: 9, next_due_date: subDays(startOfDay(new Date()), 1)}
		];
	}

	$get() {
		// Return the mock schedules object
		return this.schedules;
	}
}

SchedulesMockProvider.$inject = [];