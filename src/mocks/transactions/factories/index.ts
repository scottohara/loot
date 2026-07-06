import type {
	BasicTransaction,
	SecurityHoldingTransaction,
	SplitTransaction,
	SplitTransactionChild,
	Subtransaction,
	SubtransferTransaction,
	Transaction,
	TransferTransaction,
} from "~/transactions/types";
import { startOfDay, subDays } from "date-fns";
import createAccount from "~/mocks/accounts/factories";
import createCategory from "~/mocks/categories/factories";
import createPayee from "~/mocks/payees/factories";
import createSecurity from "~/mocks/securities/factories";

let id = 1;

function createPartialTransaction(
	props: Partial<SplitTransactionChild | Transaction>,
): Partial<SplitTransactionChild | Transaction> {
	id++;

	return {
		id,
		memo: "",
		flag_type: null,
		flag: null,
		balance: 0,
		transaction_date: subDays(startOfDay(new Date()), 1),
		status: "",
		...props,
	};
}

function createPartialCashTransaction(
	props: Partial<
		| BasicTransaction
		| SplitTransaction
		| SubtransferTransaction
		| TransferTransaction
	>,
): Partial<
	| BasicTransaction
	| SplitTransaction
	| SubtransferTransaction
	| TransferTransaction
> {
	return createPartialTransaction({
		amount: 0,
		primary_account: createAccount({ id: 1, name: "Account 1" }),
		direction: "inflow",
		...props,
	}) as Partial<
		| BasicTransaction
		| SplitTransaction
		| SubtransferTransaction
		| TransferTransaction
	>;
}

function createPartialPayeeTransaction(
	props: Partial<
		| BasicTransaction
		| SplitTransaction
		| SubtransferTransaction
		| TransferTransaction
	>,
): Partial<
	| BasicTransaction
	| SplitTransaction
	| SubtransferTransaction
	| TransferTransaction
> {
	return createPartialCashTransaction({
		payee: createPayee({ id: 1, name: "Payee 1" }),
		...props,
	});
}

function createPartialSecurityTransaction(
	props: Partial<SecurityHoldingTransaction>,
): Partial<SecurityHoldingTransaction> {
	return createPartialTransaction({
		security: createSecurity({ id: 1, name: "Security 1" }),
		primary_account: createAccount({ id: 1, name: "Account 1" }),
		category: {
			id: "AddShares",
			name: "Add Shares",
		},
		direction: "inflow",
		...props,
	}) as Partial<SecurityHoldingTransaction>;
}

export function createBasicTransaction(
	props: Partial<BasicTransaction> = {},
): BasicTransaction {
	return createPartialPayeeTransaction({
		transaction_type: "Basic",
		category: createCategory({ id: 1, name: "Category 1" }),
		subcategory: createCategory({ id: 2, name: "Category 2", parent_id: 1 }),
		...props,
	}) as BasicTransaction;
}

export function createTransferTransaction(
	props: Partial<TransferTransaction> = {},
): TransferTransaction {
	return createPartialPayeeTransaction({
		transaction_type: "Transfer",
		category: {
			id: "TransferTo",
			name: "Transfer To",
		},
		account: createAccount({ id: 2, name: "Account 2" }),
		related_status: "",
		...props,
	}) as TransferTransaction;
}

export function createSplitTransaction(
	props: Partial<SplitTransaction> = {},
): SplitTransaction {
	return createPartialPayeeTransaction({
		transaction_type: "Split",
		direction: "outflow",
		category: {
			id: "SplitTo",
			name: "Split To",
		},
		subtransactions: [],
		showSubtransactions: false,
		loadingSubtransactions: false,
		...props,
	}) as SplitTransaction;
}

export function createSubtransferTransaction(
	props: Partial<SubtransferTransaction> = {},
): SubtransferTransaction {
	return createPartialPayeeTransaction({
		transaction_type: "Subtransfer",
		category: {
			id: "TransferTo",
			name: "Transfer To",
		},
		account: createAccount({ id: 2, name: "Account 2" }),
		related_status: "",
		...props,
	}) as SubtransferTransaction;
}

export function createSubtransaction(
	props: Partial<Subtransaction> = {},
): Subtransaction {
	return createPartialTransaction({
		transaction_type: "Sub",
		category: createCategory({ id: 1, name: "Category 1" }),
		subcategory: createCategory({ id: 2, name: "Category 2", parent_id: 1 }),
		...props,
	}) as Subtransaction;
}

export function createSecurityHoldingTransaction(
	props: Partial<SecurityHoldingTransaction> = {},
): SecurityHoldingTransaction {
	return createPartialSecurityTransaction({
		transaction_type: "SecurityHolding",
		quantity: 1,
		...props,
	}) as SecurityHoldingTransaction;
}
