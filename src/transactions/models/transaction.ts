import type {
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	SubcategorisableTransaction,
	Transaction,
	TransactionBatch,
	TransactionFetchDirection,
	TransactionStatus,
	TransferrableTransaction,
} from "~/transactions/types";
import type { EntityModel, NewOrExistingEntity } from "~/loot/types";
import { lightFormat, parseISO, startOfDay } from "date-fns";
import type AccountModel from "~/accounts/models/account";
import type { Category } from "~/categories/types";
import type CategoryModel from "~/categories/models/category";
import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";
import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import angular from "angular";

export default class TransactionModel {
	private lastUsedTransactionDate: Date | string | undefined = startOfDay(
		new Date(),
	);

	private readonly SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY =
		"lootShowAllTransactionDetails";

	public constructor(
		private readonly $http: angular.IHttpService,
		private readonly $window: angular.IWindowService,
		private readonly accountModel: AccountModel,
		private readonly payeeModel: PayeeModel,
		private readonly categoryModel: CategoryModel,
		private readonly securityModel: SecurityModel,
	) {}

	// Returns the last used transaction date
	public get lastTransactionDate(): Date | string | undefined {
		return this.lastUsedTransactionDate;
	}

	// Returns the API path
	public path(id?: number): string {
		return `/transactions${undefined === id ? "" : `/${id}`}`;
	}

	// Returns the full API path including parent context
	public fullPath(context: string, id?: number): string {
		return `${context}${this.path(id)}`;
	}

	// Retrieves a batch of transactions
	public all(
		context: string,
		fromDate: Date | null,
		direction: TransactionFetchDirection,
		unreconciledOnly: boolean,
	): angular.IPromise<TransactionBatch> {
		return this.$http
			.get(this.fullPath(context), {
				params: {
					as_at: fromDate,
					direction,
					unreconciled: unreconciledOnly,
				},
			})
			.then(
				(
					response: angular.IHttpResponse<TransactionBatch>,
				): TransactionBatch => {
					response.data.transactions = response.data.transactions.map(
						this.parse.bind(this),
					);

					return response.data;
				},
			);
	}

	// Searches for a batch of transactions
	public query(
		query: string,
		fromDate: Date | null,
		direction: TransactionFetchDirection,
	): angular.IPromise<TransactionBatch> {
		return this.$http
			.get(this.path(), {
				params: {
					query,
					as_at: fromDate,
					direction,
				},
			})
			.then(
				(
					response: angular.IHttpResponse<TransactionBatch>,
				): TransactionBatch => {
					response.data.transactions = response.data.transactions.map(
						this.parse.bind(this),
					);

					return response.data;
				},
			);
	}

	// Retrieves subtransactions for a given split transaction
	public findSubtransactions(
		id: number,
	): angular.IPromise<SplitTransactionChild[]> {
		return this.$http
			.get(`${this.path(id)}/subtransactions`)
			.then(
				(
					response: angular.IHttpResponse<SplitTransactionChild[]>,
				): SplitTransactionChild[] => response.data,
			);
	}

	// Retrieves a single transaction
	public find(id: number): angular.IPromise<Transaction> {
		return this.$http
			.get(this.path(id))
			.then(
				(response: angular.IHttpResponse<Transaction>): Transaction =>
					this.parse(response.data),
			);
	}

	// Saves a transaction
	public save(transaction: Transaction): angular.IPromise<Transaction> {
		// Invalidate the payee, category, subcategory and/or security $http caches
		this.invalidateCaches(transaction);

		return this.$http({
			method: null === transaction.id ? "POST" : "PATCH",
			url: this.path(transaction.id ?? undefined),
			data: this.stringify(transaction),
		}).then((response: angular.IHttpResponse<Transaction>): Transaction => {
			this.lastUsedTransactionDate = transaction.transaction_date;

			return this.parse(response.data);
		});
	}

	// Deletes a transaction
	public destroy(transaction: Transaction): angular.IHttpPromise<void> {
		// Invalidate the payee, category, subcategory and/or security $http caches
		this.invalidateCaches(transaction);

		return this.$http.delete(this.path(Number(transaction.id)));
	}

	// Updates the status of a transaction
	public updateStatus(
		context: string,
		id: number,
		status: TransactionStatus = "",
	): angular.IHttpPromise<void> {
		return this.$http({
			method: null === status || "" === status ? "DELETE" : "PATCH",
			url: `${this.fullPath(context, id)}/status${
				null === status || "" === status ? "" : `?${status}`
			}`,
		});
	}

	// Flags a transaction
	public flag(transaction: Transaction): angular.IHttpPromise<void> {
		return this.$http.put(`${this.path(Number(transaction.id))}/flag`, {
			flag_type: transaction.flag_type,
			memo: transaction.flag,
		});
	}

	// Unflags a transaction
	public unflag(id: number): angular.IHttpPromise<void> {
		return this.$http.delete(`${this.path(id)}/flag`);
	}

	// Get the show all details setting from local storage
	public allDetailsShown(): boolean {
		return (
			this.$window.localStorage.getItem(
				this.SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY,
			) !== "false"
		);
	}

	// Set the show all details setting in local storage
	public showAllDetails(showAllDetails: boolean): void {
		this.$window.localStorage.setItem(
			this.SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY,
			String(showAllDetails),
		);
	}

	// Performs post-processing after parsing from JSON
	private parse(transaction: Transaction): Transaction {
		// Convert the transaction date from a string ("yyyy-MM-dd") to a native JS date
		if (undefined !== transaction.transaction_date) {
			transaction.transaction_date = startOfDay(
				parseISO(transaction.transaction_date as string),
			);
		}

		return transaction;
	}

	// Performs pre-processing before stringifying from JSON
	private stringify(transaction: Transaction): Transaction {
		// To avoid timezone issue, convert the native JS date back to a string ("yyyy-MM-dd") before saving
		const transactionCopy: Transaction = angular.copy(transaction);

		if (undefined !== transactionCopy.transaction_date) {
			transactionCopy.transaction_date = lightFormat(
				transactionCopy.transaction_date as Date,
				"yyyy-MM-dd",
			);
		}

		return transactionCopy;
	}

	// Helper function to handle all $http cache invalidations
	private invalidateCaches(transaction: Transaction): void {
		this.invalidateCache(this.accountModel, transaction.primary_account);
		this.invalidateCache(
			this.payeeModel,
			(transaction as PayeeCashTransaction).payee as Payee,
		);
		this.invalidateCache(
			this.categoryModel,
			(transaction as CategorisableTransaction).category as Category,
		);
		this.invalidateCache(
			this.categoryModel,
			(transaction as SubcategorisableTransaction).subcategory as Category,
		);
		this.invalidateCache(
			this.accountModel,
			(transaction as TransferrableTransaction).account,
		);
		this.invalidateCache(
			this.securityModel,
			(transaction as SecurityTransaction).security as Security,
		);

		// Subtransactions
		angular.forEach(
			(transaction as SplitTransaction).subtransactions,
			(subtransaction: SplitTransactionChild): void => {
				this.invalidateCache(
					this.categoryModel,
					subtransaction.category as Category,
				);
				this.invalidateCache(
					this.categoryModel,
					(subtransaction as SubcategorisableTransaction)
						.subcategory as Category,
				);
				this.invalidateCache(
					this.accountModel,
					(subtransaction as TransferrableTransaction).account,
				);
			},
		);
	}

	// Helper function to handle a single $http cache invalidation
	private invalidateCache(
		itemModel: EntityModel,
		item: NewOrExistingEntity | null,
	): void {
		if ("string" === typeof item && "" !== item) {
			// Item is new; flush the corresponding $http cache
			itemModel.flush();
		} else if (
			undefined !== item &&
			null !== item &&
			"" !== item &&
			undefined !== item.id
		) {
			// Item is existing; remove single item from the corresponding $http cache
			itemModel.flush(item.id);
		}
	}
}

TransactionModel.$inject = [
	"$http",
	"$window",
	"accountModel",
	"payeeModel",
	"categoryModel",
	"securityModel",
];
