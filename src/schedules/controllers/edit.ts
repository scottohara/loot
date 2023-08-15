import type {
	Account,
	AccountType,
	Accounts,
	StoredAccountType
} from "~/accounts/types";
import type {
	CashTransaction,
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	SubcategorisableTransaction,
	SubtransactionType,
	Transaction,
	TransactionDirection,
	TransactionType,
	TransferrableTransaction
} from "~/transactions/types";
import type {
	Category,
	DisplayCategory
} from "~/categories/types";
import type {
	ScheduleFrequency,
	ScheduledTransaction
} from "~/schedules/types";
import {
	addMonths,
	addQuarters,
	addWeeks,
	addYears,
	startOfDay
} from "date-fns";
import type AccountModel from "~/accounts/models/account";
import type CategoryModel from "~/categories/models/category";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";
import type ScheduleModel from "~/schedules/models/schedule";
import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import type TransactionModel from "~/transactions/models/transaction";
import angular from "angular";

export default class ScheduleEditController {
	public transaction: ScheduledTransaction;

	public mode: "Add Schedule" | "Edit Schedule" | "Enter Transaction";

	public readonly schedule: ScheduledTransaction;

	public loadingLastTransaction = false;

	public totalAllocated: number | null = null;

	public errorMessage: string | null = null;

	private account_type: AccountType | null = null;

	private readonly scheduleFrequencies: ScheduleFrequency[] = ["Weekly", "Fortnightly", "Monthly", "Bimonthly", "Quarterly", "Yearly"];

	private readonly showError: (message?: string) => void;

	public constructor($scope: angular.IScope,
						private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly filterFilter: angular.IFilterFilter,
						private readonly limitToFilter: angular.IFilterLimitTo,
						private readonly currencyFilter: angular.IFilterCurrency,
						private readonly numberFilter: angular.IFilterNumber,
						private readonly payeeModel: PayeeModel,
						private readonly securityModel: SecurityModel,
						private readonly categoryModel: CategoryModel,
						private readonly accountModel: AccountModel,
						private readonly transactionModel: TransactionModel,
						private readonly scheduleModel: ScheduleModel,
						ogModalErrorService: OgModalErrorService,
						schedule: ScheduledTransaction | undefined) {
		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);
		this.transaction = angular.extend({ id: null, transaction_type: "Basic", next_due_date: startOfDay(new Date()) }, schedule) as ScheduledTransaction;

		// When schedule is passed, start in "Enter Transaction" mode; otherwise start in "Add Schedule" mode
		this.mode = undefined === schedule ? "Add Schedule" : "Enter Transaction";

		// When schedule is passed, schedule & transaction are different objects; otherwise same object
		this.schedule = undefined === schedule ? this.transaction : angular.copy(this.transaction);

		if (undefined !== schedule) {
			// Set the transaction id to null, so that on save a new transaction is created
			this.transaction.id = null;

			// Default the transaction date to the next due date
			this.transaction.transaction_date = this.schedule.next_due_date;
		}

		// Set the auto-flag property based on the presence/absence of a flag type
		this.schedule.autoFlag = Boolean(this.schedule.flag_type);
		this.schedule.flag_type ??= "followup";
		if ("(no memo)" === this.schedule.flag) {
			this.schedule.flag = null;
		}

		// Prefetch the payees list so that the cache is populated
		payeeModel.all().catch(this.showError);

		// Watch the subtransactions array and recalculate the total allocated
		$scope.$watch((): SplitTransactionChild[] => (this.transaction as SplitTransaction).subtransactions, (newValue: SplitTransactionChild[], oldValue: SplitTransactionChild[]): void => {
			if (newValue !== oldValue && (this.transaction as SplitTransaction).subtransactions as SplitTransactionChild[] | undefined) {
				this.totalAllocated = (this.transaction as SplitTransaction).subtransactions.reduce((total: number, subtransaction: SplitTransactionChild): number => total + (isNaN(Number(subtransaction.amount)) ? 0 : Number(subtransaction.amount) * (subtransaction.direction === this.transaction.direction ? 1 : -1)), 0);

				// If we're adding a new transaction, join the subtransaction memos and update the parent memo
				if (null === this.transaction.id) {
					this.memoFromSubtransactions();
				}
			}
		}, true);
	}

	// List of payees for the typeahead
	public payees(filter: string, limit: number): angular.IPromise<Payee[]> {
		return this.payeeModel.all().then((payees: Payee[]): Payee[] => this.limitToFilter(this.filterFilter(payees, { name: filter }), limit));
	}

	// List of securities for the typeahead
	public securities(filter: string, limit: number): angular.IPromise<Security[]> {
		return this.securityModel.all().then((securities: Security[]): Security[] => this.limitToFilter(this.filterFilter(securities, { name: filter }), limit));
	}

	// List of categories for the typeahead
	public categories(filter: string, limit: number, parent?: Category | null, includeSplits = false): angular.IPromise<DisplayCategory[]> | DisplayCategory[] {
		// If a parent was specified but it doesn't have an id, return an empty array
		if (undefined !== parent && null !== parent && isNaN(Number(parent.id))) {
			return [];
		}

		return this.categoryModel.all(parent?.id).then((categories: Category[]): DisplayCategory[] => {
			let psuedoCategories: DisplayCategory[] = categories;

			// For the category dropdown, include psuedo-categories that change the transaction type
			if (undefined === parent || null === parent) {
				if (includeSplits) {
					psuedoCategories = ([
						{ id: "SplitTo", name: "Split To" },
						{ id: "SplitFrom", name: "Split From" },
						{ id: "Payslip", name: "Payslip" },
						{ id: "LoanRepayment", name: "Loan Repayment" }
					] as DisplayCategory[]).concat(psuedoCategories);
				}

				psuedoCategories = ([
					{ id: "TransferTo", name: "Transfer To" },
					{ id: "TransferFrom", name: "Transfer From" }
				] as DisplayCategory[]).concat(psuedoCategories);
			}

			return this.limitToFilter(this.filterFilter(psuedoCategories, { name: filter }), limit);
		});
	}

	// List of investment categories for the typeahead
	public investmentCategories(filter?: string): DisplayCategory[] {
		const categories: DisplayCategory[] = [
			{ id: "Buy", name: "Buy" },
			{ id: "Sell", name: "Sell" },
			{ id: "DividendTo", name: "Dividend To" },
			{ id: "AddShares", name: "Add Shares" },
			{ id: "RemoveShares", name: "Remove Shares" },
			{ id: "TransferTo", name: "Transfer To" },
			{ id: "TransferFrom", name: "Transfer From" }
		];

		return undefined === filter ? categories : this.filterFilter(categories, { name: filter });
	}

	// Returns true if the passed value is typeof string (and is not empty)
	public isString(object: Record<string, unknown> | string): boolean {
		return "string" === typeof object && object.length > 0;
	}

	// Handler for payee changes
	public payeeSelected(): void {
		// If we're adding a new schedule and an existing payee is selected
		if (null === this.transaction.id && "object" === typeof (this.transaction as PayeeCashTransaction).payee && "Enter Transaction" !== this.mode) {
			// Show the loading indicator
			this.loadingLastTransaction = true;

			// Get the previous transaction for the payee
			this.payeeModel.findLastTransaction(Number(((this.transaction as PayeeCashTransaction).payee as Payee).id), this.transaction.primary_account.account_type as StoredAccountType)
				.then(this.getSubtransactions.bind(this))
				.then(this.useLastTransaction.bind(this))
				.then((): false => (this.loadingLastTransaction = false))
				.catch(this.showError);
		}
	}

	// Handler for security changes
	public securitySelected(): void {
		// If we're adding a new schedule and an existing security is selected
		if (null === this.transaction.id && "object" === typeof (this.transaction as SecurityTransaction).security && "Enter Transaction" !== this.mode) {
			// Show the loading indicator
			this.loadingLastTransaction = true;

			// Get the previous transaction for the security
			this.securityModel.findLastTransaction(Number(((this.transaction as SecurityTransaction).security as Security).id), this.transaction.primary_account.account_type as StoredAccountType)
				.then(this.getSubtransactions.bind(this))
				.then(this.useLastTransaction.bind(this))
				.then((): false => (this.loadingLastTransaction = false))
				.catch(this.showError);
		}
	}

	// Handler for category changes (`index` is the subtransaction index, or null for the main schedule)
	public categorySelected(index?: number): void {
		const transaction: SplitTransactionChild | Transaction = isNaN(Number(index)) ? this.transaction : (this.transaction as SplitTransaction).subtransactions[Number(index)];
		let	type: SubtransactionType | TransactionType | undefined,
				direction: TransactionDirection | undefined,
				parentId: number | undefined;

		// Check the category selection
		if (undefined !== transaction.category && "object" === typeof transaction.category) {
			if (isNaN(Number(index))) {
				switch (String(transaction.category.id)) {
					case "TransferTo":
						type = "Transfer";
						direction = "outflow";
						break;

					case "TransferFrom":
						type = "Transfer";
						direction = "inflow";
						break;

					case "SplitTo":
						type = "Split";
						direction = "outflow";
						break;

					case "SplitFrom":
						type = "Split";
						direction = "inflow";
						break;

					case "Payslip":
						type = "Payslip";
						direction = "inflow";
						break;

					case "LoanRepayment":
						type = "LoanRepayment";
						direction = "outflow";
						break;

					default:
						type = "Basic";
						({ direction } = (transaction as CategorisableTransaction & TransferrableTransaction).category as Category);
						break;
				}

				/*
				 * If we have switched to a Split, Payslip or Loan Repayment and there are currently no subtransactions,
				 * create some stubs, copying the current transaction details into the first entry
				 */
				switch (type) {
					case "Split":
					case "Payslip":
					case "LoanRepayment":
						if (undefined === (transaction as SplitTransaction).subtransactions as SplitTransactionChild[] | undefined) {
							(transaction as SplitTransaction).subtransactions = [
								{
									memo: transaction.memo,
									amount: (transaction as CashTransaction).amount
								},
								{},
								{},
								{}
							];
						}
						break;

					default:
				}
			} else {
				switch (String(transaction.category.id)) {
					case "TransferTo":
						type = "Subtransfer";
						direction = "outflow";
						break;

					case "TransferFrom":
						type = "Subtransfer";
						direction = "inflow";
						break;

					default:
						type = "Sub";
						({ direction } = (transaction as CategorisableTransaction & TransferrableTransaction).category as Category);
						break;
				}
			}

			parentId = ((transaction as CategorisableTransaction).category as Category).id;
		}

		// Update the transaction type & direction
		transaction.transaction_type = type ?? (isNaN(Number(index)) ? "Basic" : "Sub");
		transaction.direction = direction ?? "outflow";

		// Make sure the subcategory is still valid
		if (undefined !== (transaction as SubcategorisableTransaction).subcategory && null !== (transaction as SubcategorisableTransaction).subcategory && ((transaction as SubcategorisableTransaction).subcategory as Category).parent_id !== parentId) {
			(transaction as SubcategorisableTransaction).subcategory = null;
		}
	}

	// Handler for investment category changes
	public investmentCategorySelected(): void {
		let	{ transaction_type, direction } = this.transaction;

		// Check the category selection
		if ("object" === typeof this.transaction.category) {
			switch (String(this.transaction.category.id)) {
				case "TransferTo":
					transaction_type = "SecurityTransfer";
					direction = "outflow";
					break;

				case "TransferFrom":
					transaction_type = "SecurityTransfer";
					direction = "inflow";
					break;

				case "RemoveShares":
					transaction_type = "SecurityHolding";
					direction = "outflow";
					break;

				case "AddShares":
					transaction_type = "SecurityHolding";
					direction = "inflow";
					break;

				case "Sell":
					transaction_type = "SecurityInvestment";
					direction = "outflow";
					break;

				case "Buy":
					transaction_type = "SecurityInvestment";
					direction = "inflow";
					break;

				case "DividendTo":
					transaction_type = "Dividend";
					direction = "outflow";
					break;

				// No default
			}

			// Update the transaction type & direction
			this.transaction.transaction_type = transaction_type;
			this.transaction.direction = direction;
		}
	}

	// Handler for primary account changes
	public primaryAccountSelected(): void {
		const selectedAccountType: AccountType | null = (this.transaction.primary_account as Account | undefined)?.account_type ?? null;

		if (null !== this.account_type && this.account_type !== selectedAccountType) {
			(this.transaction as CategorisableTransaction).category = null;
			(this.transaction as SubcategorisableTransaction).subcategory = null;
		}
		this.account_type = selectedAccountType;

		if (null !== (this.transaction as TransferrableTransaction).account && (undefined !== (this.transaction as TransferrableTransaction).account as Account | undefined) && undefined !== this.transaction.primary_account as Account | undefined && this.transaction.primary_account.id === ((this.transaction as TransferrableTransaction).account as Account).id) {
			// Primary account and transfer account can't be the same, so clear the transfer account
			(this.transaction as TransferrableTransaction).account = null;
		}
	}

	// Joins the subtransaction memos and updates the parent memo
	public memoFromSubtransactions(): void {
		this.transaction.memo = (this.transaction as SplitTransaction).subtransactions.reduce((memo: string, subtransaction: SplitTransactionChild): string => `${memo}${undefined === subtransaction.memo ? "" : `${memo ? "; " : ""}${subtransaction.memo}`}`, "");
	}

	// List of primary accounts for the typeahead
	public primaryAccounts(filter: string, limit: number): angular.IPromise<Account[]> {
		return this.accountModel.all().then((accounts: Account[] | Accounts): Account[] => this.limitToFilter(this.filterFilter(accounts as Account[], { name: filter }), limit));
	}

	// List of accounts for the typeahead
	public accounts(filter: string, limit: number): angular.IPromise<Account[]> {
		return this.accountModel.all().then((accounts: Account[]): Account[] => {
			let filteredAccounts: Account[] = accounts;

			// Exclude investment accounts by default
			const accountFilter: angular.IFilterFilterPatternObject = {
				name: filter,
				account_type: "!investment"
			};

			// Filter the primary account from the results (can't transfer to self)
			if (undefined !== this.transaction.primary_account as Account | undefined) {
				filteredAccounts = this.filterFilter(filteredAccounts, { name: `!${this.transaction.primary_account.name}` }, true);
			}

			// For security transfers, only include investment accounts
			if ("SecurityTransfer" === this.transaction.transaction_type) {
				accountFilter.account_type = "investment";
			}

			return this.limitToFilter(this.filterFilter(filteredAccounts, accountFilter), limit);
		});
	}

	// List of frequencies for the typeahead
	public frequencies(filter?: string): ScheduleFrequency[] {
		return undefined === filter ? this.scheduleFrequencies : this.filterFilter(this.scheduleFrequencies, filter);
	}

	// Add a new subtransaction
	public addSubtransaction(): void {
		(this.transaction as SplitTransaction).subtransactions.push({});
	}

	// Deletes a subtransaction
	public deleteSubtransaction(index: number): void {
		(this.transaction as SplitTransaction).subtransactions.splice(index, 1);
	}

	// Adds any unallocated amount to the specified subtransaction
	public addUnallocatedAmount(index: number): void {
		const amount: number | undefined = Number((this.transaction as SplitTransaction).subtransactions[index].amount);

		(this.transaction as SplitTransaction).subtransactions[index].amount = (isNaN(amount) ? 0 : amount) + ((this.transaction as SplitTransaction).amount - Number(this.totalAllocated));
	}

	// Updates the transaction amount and memo when the quantity, price or commission change
	public updateInvestmentDetails(): void {
		const QUANTITY_DECIMAL_PLACES = 4,
					PRICE_DECIMAL_PLACES = 3,
					AMOUNT_DECIMAL_PLACES = 2;

		if ("SecurityInvestment" === this.transaction.transaction_type) {
			// Base amount is the quantity multiplied by the price
			const amount = Number((Number(this.transaction.quantity) * Number(this.transaction.price)).toFixed(AMOUNT_DECIMAL_PLACES)),
						commission = Number(this.transaction.commission);

			this.transaction.amount = isNaN(amount) ? 0 : amount;

			// For a purchase, commission is added to the cost; for a sale, commission is subtracted from the proceeds
			if ("inflow" === this.transaction.direction) {
				this.transaction.amount += isNaN(commission) ? 0 : commission;
			} else {
				this.transaction.amount -= isNaN(commission) ? 0 : commission;
			}
		}

		// If we're adding a new buy or sell transaction, update the memo with the details
		if (null === this.transaction.id && "SecurityInvestment" === this.transaction.transaction_type) {
			const quantity: string = Number(this.transaction.quantity) > 0 ? this.numberFilter(this.transaction.quantity, QUANTITY_DECIMAL_PLACES) : "",
						price: string = Number(this.transaction.price) > 0 ? ` @ ${this.currencyFilter(this.transaction.price, undefined, PRICE_DECIMAL_PLACES)}` : "",
						commission: string = Number(this.transaction.commission) > 0 ? ` (${"inflow" === this.transaction.direction ? "plus" : "less"} ${this.currencyFilter(this.transaction.commission)} commission)` : "";

			this.transaction.memo = quantity + price + commission;
		}
	}

	// Switches from Enter Transaction mode to Edit Schedule mode
	public edit(): void {
		this.mode = "Edit Schedule";
		this.transaction = this.schedule;
	}

	// Enter a transaction based on the schedule, update the next due date and close the modal
	public enter(): void {
		this.errorMessage = null;
		this.transactionModel.save(this.transaction).then((): void => this.skip(), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Skip the next scheduled occurrence, update the next due date and close the modal
	public skip(): void {
		// Calculate the next due date for the schedule
		this.calculateNextDue();

		// Update the schedule
		this.save(true);
	}

	// Save and close the modal
	public save(skipped?: boolean): void {
		this.errorMessage = null;

		// Ensure the flag is appropriately set or cleared
		if (this.schedule.autoFlag) {
			this.schedule.flag ??= "(no memo)";
		} else {
			this.schedule.flag_type = null;
			this.schedule.flag = null;
		}

		this.scheduleModel.save(this.schedule).then((schedule: ScheduledTransaction): void => this.$uibModalInstance.close({ data: schedule, skipped: Boolean(skipped) }), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}

	// Fetches the subtransactions for a transaction
	private getSubtransactions(transaction?: Transaction): angular.IPromise<SplitTransaction> | Transaction | undefined {
		if (undefined === transaction) {
			return undefined;
		}

		// If the last transaction was a Split/Loan Repayment/Payslip; fetch the subtransactions
		switch (transaction.transaction_type) {
			case "Split":
			case "LoanRepayment":
			case "Payslip":
				transaction.subtransactions = [];

				return this.transactionModel.findSubtransactions(Number(transaction.id)).then((subtransactions: SplitTransactionChild[]): SplitTransaction => {
					// Strip the subtransaction ids
					transaction.subtransactions = subtransactions.map((subtransaction: SplitTransactionChild): SplitTransactionChild => {
						subtransaction.id = null;

						return subtransaction;
					});

					return transaction;
				});
			default:
				return transaction;
		}
	}

	// Merges the details of a previous transaction into the current one
	private useLastTransaction(transaction?: Partial<ScheduledTransaction>): void {
		if (undefined === transaction) {
			return;
		}

		// Strip the id, primary account, next due date, transaction date, frequency and status
		delete transaction.id;
		delete transaction.primary_account;
		delete transaction.next_due_date;
		delete transaction.transaction_date;
		delete transaction.frequency;
		delete transaction.status;
		delete (transaction as Partial<TransferrableTransaction>).related_status;

		// Retain the schedule's flag (if any), don't overwrite with the previous transaction's flag
		transaction.flag_type = this.transaction.flag_type;
		transaction.flag = this.transaction.flag;

		// Merge the last transaction details into the transaction on the scope
		this.transaction = angular.extend(this.transaction, transaction) as ScheduledTransaction;

		// Depending on which field has focus, re-trigger the focus event handler to format/select the new value
		angular.forEach(angular.element("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo"), (field: Element): void => {
			if (field === document.activeElement) {
				this.$timeout((): void => angular.element(field).triggerHandler("focus")).catch(this.showError);
			}
		});
	}

	// Calculates the next due date
	private calculateNextDue(): void {
		const WEEK = 1,
					FORTNIGHT = 2,
					MONTH = 1,
					BIMONTH = 2,
					QUARTER = 1,
					YEAR = 1;

		let addFn = addWeeks,
				amount = 0;

		switch (this.schedule.frequency) {
			case "Weekly":
				addFn = addWeeks;
				amount = WEEK;
				break;

			case "Fortnightly":
				addFn = addWeeks;
				amount = FORTNIGHT;
				break;

			case "Monthly":
				addFn = addMonths;
				amount = MONTH;
				break;

			case "Bimonthly":
				addFn = addMonths;
				amount = BIMONTH;
				break;

			case "Quarterly":
				addFn = addQuarters;
				amount = QUARTER;
				break;

			case "Yearly":
				addFn = addYears;
				amount = YEAR;
				break;

			// No default
		}

		this.schedule.next_due_date = addFn(this.schedule.next_due_date as Date, amount);

		if (this.schedule.overdue_count > 0) {
			this.schedule.overdue_count--;
		}
	}
}

ScheduleEditController.$inject = ["$scope", "$uibModalInstance", "$timeout", "filterFilter", "limitToFilter", "currencyFilter", "numberFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "ogModalErrorService", "schedule"];