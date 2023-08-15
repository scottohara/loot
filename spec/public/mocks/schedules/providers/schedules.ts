import {
	startOfDay,
	subDays
} from "date-fns";
import type { Mock } from "~/mocks/types";
import type { ScheduledBasicTransaction } from "~/schedules/types";
import { createScheduledBasicTransaction } from "~/mocks/schedules/factories";

function *schedules(count: number): Iterable<ScheduledBasicTransaction> {
	for (let id = 1, daysAgo = count + 1; id < count + 1; id++, daysAgo--) {
		yield createScheduledBasicTransaction({
			id,
			next_due_date: subDays(startOfDay(new Date()), daysAgo)
		});
	}
}

export default class SchedulesMockProvider implements Mock<ScheduledBasicTransaction[]> {
	private readonly schedules: ScheduledBasicTransaction[];

	// Mock schedules object
	public constructor() {
		this.schedules = [...schedules(9)];
	}

	public $get(): ScheduledBasicTransaction[] {
		// Return the mock schedules object
		return this.schedules;
	}
}

SchedulesMockProvider.$inject = [];