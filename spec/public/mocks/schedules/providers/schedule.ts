import {Mock} from "mocks/types";
import {ScheduledTransferTransaction} from "schedules/types";
import {createScheduledTransferTransaction} from "mocks/schedules/factories";

export default class ScheduleMockProvider implements Mock<ScheduledTransferTransaction> {
	// Mock schedule object
	public constructor(private readonly schedule: ScheduledTransferTransaction = createScheduledTransferTransaction({id: 1})) {}

	public $get(): ScheduledTransferTransaction {
		// Return the mock schedule object
		return this.schedule;
	}
}

ScheduleMockProvider.$inject = [];