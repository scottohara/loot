import {
	Schedule,
	ScheduleFrequency,
	ScheduledBasicTransaction,
	ScheduledSecurityHoldingTransaction,
	ScheduledSplitTransaction,
	ScheduledTransferTransaction
} from "schedules/types";
import {
	addDays,
	startOfDay
} from "date-fns";
import {
	createBasicTransaction,
	createSecurityHoldingTransaction,
	createSplitTransaction,
	createTransferTransaction
} from "mocks/transactions/factories";

function createSchedule(props: Partial<Schedule> & {transaction_date: Date;} = { transaction_date: new Date() }): Schedule & {transaction_date: Date;} {
	return {
		transaction_date: new Date(),
		frequency: "Monthly" as ScheduleFrequency,
		next_due_date: addDays(startOfDay(new Date()), 3),
		auto_enter: false,
		autoFlag: false,
		overdue_count: 0,
		estimate: false,
		...props
	};
}

export function createScheduledBasicTransaction(props: Partial<ScheduledBasicTransaction> = {}): ScheduledBasicTransaction {
	return Object.assign(createBasicTransaction(), createSchedule(), props);
}

export function createScheduledTransferTransaction(props: Partial<ScheduledTransferTransaction>): ScheduledTransferTransaction {
	return Object.assign(createTransferTransaction(), createSchedule(), props);
}

export function createScheduledSplitTransaction(props: Partial<ScheduledSplitTransaction> = {}): ScheduledSplitTransaction {
	return Object.assign(createSplitTransaction(), createSchedule(), props);
}

export function createScheduledSecurityHoldingTransaction(props: Partial<ScheduledSecurityHoldingTransaction>): ScheduledSecurityHoldingTransaction {
	return Object.assign(createSecurityHoldingTransaction(), createSchedule(), props);
}