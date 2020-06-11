import {
	Account,
	StoredAccountType
} from "accounts/types";
import {
	CashTransaction,
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	SubcategorisableTransaction,
	Subtransaction,
	SubtransactionType,
	SubtransferTransaction,
	Transaction,
	TransactionDirection,
	TransactionType,
	TransferrableTransaction
} from "transactions/types";
import {
	Category,
	DisplayCategory
} from "categories/types";
import {
	Entity,
	EntityModel
} from "loot/types";
import AccountModel from "accounts/models/account";
import CategoryModel from "categories/models/category";
import OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import { Payee } from "payees/types";
import PayeeModel from "payees/models/payee";
import { Security } from "securities/types";
import SecurityModel from "securities/models/security";
import TransactionModel from "transactions/models/transaction";
import angular from "angular";

export default class TransactionEditController {
	public transaction: Transaction;

	public readonly mode: "Edit" | "Add";

	public loadingLastTransaction = false;

	public totalAllocated: number | null = null;

	public errorMessage: string | null = null;

	private readonly showError: (message?: string) => void;

	public constructor($scope: angular.IScope,
						private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly $q: angular.IQService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly filterFilter: angular.IFilterFilter,
						private readonly limitToFilter: angular.IFilterLimitTo,
						private readonly currencyFilter: angular.IFilterCurrency,
						private readonly payeeModel: PayeeModel,
						private readonly securityModel: SecurityModel,
						private readonly categoryModel: CategoryModel,
						private readonly accountModel: AccountModel,
						private readonly transactionModel: TransactionModel,
						ogModalErrorService: OgModalErrorService,
						private readonly originalTransaction: Transaction) {
		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);
		this.transaction = angular.extend({ id: null }, originalTransaction) as Transaction;
		this.mode = null === this.transaction.id ? "Add" : "Edit";

		// Watch the subtransactions array and recalculate the total allocated
		$scope.$watch((): SplitTransactionChild[] => (this.transaction as SplitTransaction).subtransactions, (): void => {
			if (undefined !== (this.transaction as SplitTransaction).subtransactions as SplitTransactionChild[] | undefined) {
				this.totalAllocated = (this.transaction as SplitTransaction).subtransactions.reduce((total: number, subtransaction: SplitTransactionChild): number => total + (isNaN(Number(subtransaction.amount)) ? 0 : Number(subtransaction.amount) * (subtransaction.direction === this.transaction.direction ? 1 : -1)), 0);

				// If we're adding a new transaction, join the subtransaction memos and update the parent memo
				if (null === this.transaction.id) {
					this.memoFromSubtransactions();
				}
			}
		}, true);

		// Prefetch the payees list so that the cache is populated
		payeeModel.all().catch(this.showError);
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

		// If the parent was specified, pass the parent's id
		const parentId: number | null = undefined === parent || null === parent ? null : Number(parent.id);

		return this.categoryModel.all(parentId).then((categories: Category[]): DisplayCategory[] => {
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
	public isString(object: string | Record<string, unknown>): boolean {
		return "string" === typeof object && object.length > 0;
	}

	// Handler for payee changes
	public payeeSelected(): void {
		// If we're adding a new transaction and an existing payee is selected
		if (null === this.transaction.id && "object" === typeof (this.transaction as PayeeCashTransaction).payee) {
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
		// If we're adding a new transaction and an existing security is selected
		if (null === this.transaction.id && "object" === typeof (this.transaction as SecurityTransaction).security) {
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

	// Handler for category changes (`index` is the subtransaction index, or null for the main transaction)
	public categorySelected(index?: number): void {
		const	transaction: Transaction | SplitTransactionChild = isNaN(Number(index)) ? this.transaction : (this.transaction as SplitTransaction).subtransactions[Number(index)];
		let	type: TransactionType | SubtransactionType | undefined,
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
		transaction.transaction_type = undefined === type ? isNaN(Number(index)) ? "Basic" : "Sub" : type;
		transaction.direction = undefined === direction ? "outflow" : direction;

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
		if (null !== (this.transaction as TransferrableTransaction).account && (undefined !== this.transaction.primary_account as Account | undefined) && this.transaction.primary_account.id === ((this.transaction as TransferrableTransaction).account as Account).id) {
			// Primary account and transfer account can't be the same, so clear the transfer account
			(this.transaction as TransferrableTransaction).account = null;
		}
	}

	// Joins the subtransaction memos and updates the parent memo
	public memoFromSubtransactions(): void {
		this.transaction.memo = (this.transaction as SplitTransaction).subtransactions.reduce((memo: string, subtransaction: SplitTransactionChild): string => `${memo}${undefined === subtransaction.memo ? "" : `${memo ? "; " : ""}${subtransaction.memo}`}`, "");
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

			// Filter the current account from the results (can't transfer to self)
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
		if ("SecurityInvestment" === this.transaction.transaction_type) {
			// Base amount is the quantity multiplied by the price
			const amount = Number(this.transaction.quantity) * Number(this.transaction.price),
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
			const	quantity: string = Number(this.transaction.quantity) > 0 ? String(this.transaction.quantity) : "",
						price: string = Number(this.transaction.price) > 0 ? ` @ ${this.currencyFilter(this.transaction.price)}` : "",
						commission: string = Number(this.transaction.commission) > 0 ? ` (${"inflow" === this.transaction.direction ? "plus" : "less"} ${this.currencyFilter(this.transaction.commission)} commission)` : "";

			this.transaction.memo = quantity + price + commission;
		}
	}

	// Save and close the modal
	public save(): void {
		this.errorMessage = null;
		this.transactionModel.save(this.transaction)
			.then(this.invalidateCaches.bind(this))
			.then(this.updateLruCaches.bind(this))
			.then((transaction: Transaction): void => this.$uibModalInstance.close(transaction))
			.catch((error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}

	// Fetches the subtransactions for a transaction
	private getSubtransactions(transaction: Transaction): angular.IPromise<Transaction> | Transaction {
		// If the last transaction was a Split/Loan Repayment/Payslip; fetch the subtransactions
		switch (transaction.transaction_type) {
			case "Split":
			case "LoanRepayment":
			case "Payslip":
				transaction.subtransactions = [];

				return this.transactionModel.findSubtransactions(Number(transaction.id)).then((subtransactions: Subtransaction[]): Transaction => {
					// Strip the subtransaction ids
					transaction.subtransactions = subtransactions.map((subtransaction: Subtransaction): Subtransaction => {
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
	private useLastTransaction(transaction: Transaction): void {
		// Strip the id, transaction date, primary account, status & flag
		delete transaction.id;
		delete transaction.transaction_date;
		delete transaction.primary_account;
		delete transaction.status;
		delete (transaction as TransferrableTransaction).related_status;
		delete transaction.flag;

		// Merge the last transaction details into the transaction on the scope
		this.transaction = angular.extend(this.transaction, transaction) as Transaction;

		// Depending on which field has focus, re-trigger the focus event handler to format/select the new value
		angular.forEach(angular.element("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo"), (field: Element): void => {
			if (field === document.activeElement) {
				this.$timeout((): void => angular.element(field).triggerHandler("focus")).catch(this.showError);
			}
		});
	}

	// Helper function to invalidate the $http caches after saving a transaction
	private invalidateCaches(savedTransaction: Transaction): angular.IPromise<Transaction> {
		// Create a deferred so that we return a promise
		const q: angular.IDeferred<Transaction> = this.$q.defer(),
					models: {[mode: string]: EntityModel;} = {
						primary_account: this.accountModel,
						payee: this.payeeModel,
						category: this.categoryModel,
						subcategory: this.categoryModel,
						account: this.accountModel,
						security: this.securityModel
					};

		let	resolve = true;

		/*
		 * Compare each facet of the saved transaction with the original values
		 * For any that have changed, invalidate the original from the $http cache
		 */
		angular.forEach(Object.keys(models), (key: keyof Transaction): void => {
			const	originalValue: number | null = undefined === this.originalTransaction[key] || null === this.originalTransaction[key] ? null : Number((this.originalTransaction[key] as Entity).id),
						savedValue: number | null = undefined === savedTransaction[key] || null === savedTransaction[key] ? null : Number((savedTransaction[key] as Entity).id);

			if (null !== originalValue && originalValue !== savedValue) {
				models[key].flush(originalValue);
			}
		});

		/*
		 * For subtransactions, we can't be sure if the values have changed or not (as the ordering may have changed)
		 * so just invalidate any categories or accounts
		 */
		switch (this.originalTransaction.transaction_type) {
			case "Split":
			case "LoanRepayment":
			case "Payslip":

				// Delay resolving the promise
				resolve = false;

				this.transactionModel.findSubtransactions(Number(this.originalTransaction.id)).then((subtransactions: SplitTransactionChild[]): void => {
					angular.forEach(subtransactions, (subtransaction: SplitTransactionChild): void => {
						if (undefined !== subtransaction.category && Number((subtransaction.category as Category).id)) {
							this.categoryModel.flush(((subtransaction as Subtransaction).category as Category).id);
						}

						if (undefined !== (subtransaction as Subtransaction).subcategory && null !== (subtransaction as Subtransaction).subcategory && Number(((subtransaction as Subtransaction).subcategory as Category).id)) {
							this.categoryModel.flush(((subtransaction as Subtransaction).subcategory as Category).id);
						}

						if (undefined !== (subtransaction as SubtransferTransaction).account as Account | undefined && Number((subtransaction as SubtransferTransaction).account.id)) {
							this.accountModel.flush((subtransaction as SubtransferTransaction).account.id);
						}
					});

					// Resolve the promise
					q.resolve(savedTransaction);
				}).catch(this.showError);
				break;

			default:
		}

		// Resolve the promise (unless explicitly delayed)
		if (resolve) {
			q.resolve(savedTransaction);
		}

		// Return the promise
		return q.promise;
	}

	// Helper function to update the LRU caches after saving a transaction
	private updateLruCaches(transaction: Transaction): angular.IPromise<Transaction> {
		// Create a deferred so that we return a promise
		const q: angular.IDeferred<Transaction> = this.$q.defer();
		let resolve = true;

		// Add the primary account to the LRU cache
		this.accountModel.addRecent(transaction.primary_account);

		// Add the payee or security to the LRU cache
		if ("investment" === transaction.primary_account.account_type.toLowerCase()) {
			this.securityModel.addRecent((transaction as SecurityTransaction).security as Security);
		} else {
			this.payeeModel.addRecent((transaction as PayeeCashTransaction).payee as Payee);
		}

		switch (transaction.transaction_type) {
			case "Basic":

				// Add the category and subcategory to the LRU cache
				this.categoryModel.addRecent(transaction.category as Category);
				if (undefined !== transaction.subcategory && null !== transaction.subcategory) {
					this.categoryModel.addRecent(transaction.subcategory as Category);
				}
				break;

			case "Transfer":
			case "SecurityTransfer":
			case "SecurityInvestment":
			case "Dividend":

				// Add the account to the LRU cache
				this.accountModel.addRecent(transaction.account as Account);
				break;

			case "Split":
			case "LoanRepayment":
			case "Payslip":

				// Delay resolving the promise
				resolve = false;

				this.transactionModel.findSubtransactions(Number(transaction.id)).then((subtransactions: SplitTransactionChild[]): void => {
					angular.forEach(subtransactions, (subtransaction: SplitTransactionChild): void => {
						if ("Subtransfer" === subtransaction.transaction_type) {
							// Add the account to the LRU cache
							this.accountModel.addRecent((subtransaction as SubtransferTransaction).account);
						} else {
							// Add the category and subcategory to the LRU cache
							this.categoryModel.addRecent(subtransaction.category as Category);
							if (undefined !== (subtransaction as Subtransaction).subcategory && null !== (subtransaction as Subtransaction).subcategory) {
								this.categoryModel.addRecent((subtransaction as Subtransaction).subcategory as Category);
							}
						}
					});

					// Resolve the promise
					q.resolve(transaction);
				}).catch(this.showError);
				break;

			default:
		}

		// Resolve the promise (unless explicitly delayed)
		if (resolve) {
			q.resolve(transaction);
		}

		// Return the promise
		return q.promise;
	}
}

TransactionEditController.$inject = ["$scope", "$uibModalInstance", "$q", "$timeout", "filterFilter", "limitToFilter", "currencyFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "ogModalErrorService", "transaction"];