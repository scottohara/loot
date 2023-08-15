import type {
	BasicTransaction,
	SecurityHoldingTransaction,
	SecurityInvestmentTransaction,
	SplitTransaction,
	Transaction,
	TransferTransaction
} from "~/transactions/types";

export type ScheduleFrequency = "Bimonthly" | "Fortnightly" | "Monthly" | "Quarterly" | "Weekly" | "Yearly";

export interface Schedule {
	next_due_date: Date | string;
	frequency: ScheduleFrequency;
	estimate: boolean;
	auto_enter: boolean;
	overdue_count: number;
	autoFlag: boolean;
}

export type ScheduledTransaction = Schedule & Transaction;
export type ScheduledBasicTransaction = BasicTransaction & Schedule;
export type ScheduledTransferTransaction = Schedule & TransferTransaction;
export type ScheduledSecurityHoldingTransaction = Schedule & SecurityHoldingTransaction;
export type ScheduledSecurityInvestmentTransaction = Schedule & SecurityInvestmentTransaction;
export type ScheduledSplitTransaction = Schedule & SplitTransaction;