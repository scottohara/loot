import type {
	Category,
	PsuedoCategory
} from "categories/types";
import type { Account } from "accounts/types";
import type { Payee } from "payees/types";
import type { Security } from "securities/types";

export type TransactionFetchDirection = "next" | "prev";
export type TransactionStatus = "" | "Cleared" | "Reconciled" | "Unreconciled" | null;
export type TransactionDirection = "inflow" | "outflow";
export type TransactionFlag = string | null | undefined;

/*
 * Transaction types
 */
export type PayeeTransactionType = "Basic" | "Transfer";
export type SplitTransactionType = "LoanRepayment" | "Payslip" | "Split";
export type SecurityTransactionType = "Dividend" | "SecurityHolding" | "SecurityInvestment" | "SecurityTransfer";
export type SubtransactionType = "Sub" | "Subtransfer";
export type TransactionType = PayeeTransactionType | SecurityTransactionType | SplitTransactionType | SubtransactionType;

/*
 * Transaction headers
 */

// All transaction headers derive from this base header
export interface TransactionHeader {
	transaction_date?: Date | string;
}

// A transaction header that has a payee
export interface PayeeTransactionHeader extends TransactionHeader {
	payee: Payee | string;
}

// A transaction header that has a security
export interface SecurityTransactionHeader extends TransactionHeader {
	security: Security | string;
}

/*
 * Abstract transactions
 */

// All transaction types derive from this base type
export interface BaseTransaction {
	id: number | null;
	transaction_type: TransactionType;
	memo: string;
	flag?: TransactionFlag;
	balance: number;
}

// A transaction that has an amount
export interface CashTransaction extends BaseTransaction {
	amount: number;
	primary_account: Account;
	direction: TransactionDirection;
}

// A transaction that has a payee
export interface PayeeCashTransaction extends CashTransaction, PayeeTransactionHeader {
	transaction_type: PayeeTransactionType | SplitTransactionType | SubtransactionType;
}

// A transaction that has a security
export interface SecurityTransaction extends BaseTransaction, SecurityTransactionHeader {
	transaction_type: SecurityTransactionType;
	primary_account: Account;
	category: PsuedoCategory;
	direction: TransactionDirection;
	status: TransactionStatus;
}

// A transaction that has a related status
export interface TransferrableTransaction {
	account: Account | null;
	related_status: TransactionStatus;
}

// A transaction that can have a category
export interface CategorisableTransaction {
	category: Category | PsuedoCategory | string | null;
}

// A transaction that can have a subcategory
export interface SubcategorisableTransaction {
	subcategory?: Category | string | null;
}

/*
 * Non-investment transaction types
 */

// Basic transaction
export interface BasicTransaction extends PayeeCashTransaction, CategorisableTransaction, SubcategorisableTransaction {
	transaction_type: "Basic";
	category: Category | string;
	status: TransactionStatus;
}

// Transfer transaction
export interface TransferTransaction extends PayeeCashTransaction, CategorisableTransaction, TransferrableTransaction {
	transaction_type: "Transfer";
	category: PsuedoCategory;
	status: TransactionStatus;
}

// Subtransaction
export interface Subtransaction extends CashTransaction, CategorisableTransaction, SubcategorisableTransaction {
	transaction_type: "Sub";
	category: Category | string;
	parent_id: number | null;
}

// Subtransfer transaction
export interface SubtransferTransaction extends PayeeCashTransaction, CategorisableTransaction, TransferrableTransaction {
	transaction_type: "Subtransfer";
	category: PsuedoCategory;
	account: Account;
	status: TransactionStatus;
	parent_id: number;
}

export type SplitTransactionChild = Partial<Subtransaction | SubtransferTransaction> | Subtransaction | SubtransferTransaction;

// Split transaction
export interface SplitTransaction extends PayeeCashTransaction, CategorisableTransaction {
	transaction_type: SplitTransactionType;
	category: PsuedoCategory;
	status: TransactionStatus;
	subtransactions: SplitTransactionChild[];
	showSubtransactions: boolean;
	loadingSubtransactions: boolean;
}

// Loan repayment transaction
export interface LoanRepaymentTransaction extends SplitTransaction {
	transaction_type: "LoanRepayment";
}

// Payslip transaction
export interface PayslipTransaction extends SplitTransaction {
	transaction_type: "Payslip";
}

/*
 * Investment transaction types
 */

// Security holding transaction
export interface SecurityHoldingTransaction extends SecurityTransaction {
	transaction_type: "SecurityHolding";
	quantity: number;
}

// Security investment transaction
export interface SecurityInvestmentTransaction extends SecurityTransaction, TransferrableTransaction {
	transaction_type: "SecurityInvestment";
	amount: number;
	quantity: number;
	price: number;
	commission: number;
}

// Security transfer transaction
export interface SecurityTransferTransaction extends SecurityTransaction, TransferrableTransaction {
	transaction_type: "SecurityTransfer";
	quantity: number;
}

// Dividend transaction
export interface DividendTransaction extends SecurityTransaction, TransferrableTransaction {
	transaction_type: "Dividend";
	amount: number;
}

// All possible transaction types
export type Transaction = BasicTransaction | DividendTransaction | LoanRepaymentTransaction | PayslipTransaction | SecurityHoldingTransaction | SecurityInvestmentTransaction | SecurityTransferTransaction | SplitTransaction | TransferTransaction;

export interface TransactionBatch {
	transactions: Transaction[];
	openingBalance: number;
	atEnd: boolean;
}

export interface TransactionStatusScope extends angular.IScope {
	transactionStatus: {
		account: Account;
		transaction: Transaction;
	};
	currentStatus: TransactionStatus;
	nextStatus: TransactionStatus;
	icon: "lock" | "tag";
	tooltip: string;
	clickHandler: () => void;
}