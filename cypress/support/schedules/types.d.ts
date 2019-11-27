import { Subtransaction } from "transactions/types";

export interface Schedule {
	nextDueDate: string;
	isAutoEntered: boolean;
	primaryAccountName: string;
	payeeOrSecurityName: string;
	categoryName: string;
	subcategoryOrAccountName?: string;
	subtransactions?: Subtransaction[];
	memo: string;
	frequency: string;
	creditAmount?: string;
	debitAmount?: string;
}

export interface ScheduleEdit extends Schedule {
	rawNextDueDate?: string;
	payeeName?: string;
	securityName?: string;
	amount?: string;
	subcategoryName?: string;
	accountName?: string;
	quantity?: string;
	price?: string;
	commission?: string;
	memoFromInvestmentDetails?: boolean;
	type?: string;
	isEstimate?: boolean;
}