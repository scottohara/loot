import "../css/index.less";
import type {
	Account,
	AccountType
} from "accounts/types";
import type {
	CashTransaction,
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	SubcategorisableTransaction,
	Subtransaction,
	Transaction,
	TransactionBatch,
	TransactionFetchDirection,
	TransferrableTransaction
} from "transactions/types";
import type {
	Entity,
	EntityModel
} from "loot/types";
import type {
	OgTableActionHandlers,
	OgTableActions
} from "og-components/og-table-navigable/types";
import {
	addDays,
	isAfter,
	isBefore,
	isEqual,
	startOfDay,
	subDays
} from "date-fns";
import type AccountModel from "accounts/models/account";
import AccountReconcileView from "accounts/views/reconcile.html";
import type { Category } from "categories/types";
import type { OgModalConfirm } from "og-components/og-modal-confirm/types";
import OgModalConfirmView from "og-components/og-modal-confirm/views/confirm.html";
import type OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import type OgViewScrollService from "og-components/og-view-scroll/services/og-view-scroll";
import type { Payee } from "payees/types";
import type { Security } from "securities/types";
import TransactionDeleteView from "transactions/views/delete.html";
import TransactionEditView from "transactions/views/edit.html";
import type TransactionModel from "transactions/models/transaction";
import angular from "angular";

export default class TransactionIndexController {
	public readonly tableActions: OgTableActions;

	public readonly today: Date = startOfDay(new Date());

	public readonly contextType?: string;

	public transactions: Transaction[] = [];

	public firstTransactionDate: Date;

	public lastTransactionDate: Date;

	public reconcileTarget = 0;

	public clearedTotal = 0;

	public unclearedTotal = 0;

	public readonly reconcilable: boolean;

	public reconciling = false;

	public showAllDetails: boolean;

	public unreconciledOnly: boolean;

	public readonly loading: { prev: boolean; next: boolean; } = { prev: false, next: false };

	private atEnd = true;

	private openingBalance = 0;

	private closingBalance = 0;

	private readonly showError: (message?: string) => void;

	public constructor($scope: angular.IScope,
						$transitions: angular.ui.IStateParamsService,
						private readonly $uibModal: angular.ui.bootstrap.IModalService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly $window: angular.IWindowService,
						private readonly $state: angular.ui.IStateService,
						private readonly transactionModel: TransactionModel,
						private readonly accountModel: AccountModel,
						private readonly ogTableNavigableService: OgTableNavigableService,
						ogViewScrollService: OgViewScrollService,
						ogModalErrorService: OgModalErrorService,
						private readonly contextModel: EntityModel | null,
						public readonly context: Entity | string,
						public readonly transactionBatch: TransactionBatch) {
		const self: this = this;

		this.contextType = contextModel?.type;
		this.firstTransactionDate = this.today;
		this.lastTransactionDate = this.today;
		this.reconcilable = "account" === this.contextType;
		this.showAllDetails = transactionModel.allDetailsShown();
		this.unreconciledOnly = this.reconcilable && accountModel.isUnreconciledOnly(Number((this.context as Entity).id));

		this.tableActions = {
			selectAction(index: number): void {
				if (self.reconciling) {
					// When reconciling, select action is to toggle the cleared status
					const transaction: Transaction = self.transactions[index];

					transaction.status = "Cleared" === transaction.status ? "" : "Cleared";
					self.toggleCleared(transaction);
				} else {
					// When not reconciling, select action is to edit the transaction
					self.editTransaction(index);
				}
			},
			editAction(index: number): void {
				self.editTransaction(index);
			},
			insertAction(): void {
				self.editTransaction();
			},
			deleteAction(index: number): void {
				self.deleteTransaction(index);
			},
			focusAction(index: number): void {
				$state.go(`${$state.includes("**.transaction") ? "^" : ""}.transaction`, { transactionId: self.transactions[index].id }).catch(self.showError);
			}
		};

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// Process the initial batch of transactions to display
		this.processTransactions(transactionBatch, undefined, Number(this.$state.params.transactionId));

		// When the transaction id state parameter changes, focus the specified row
		$scope.$on("$destroy", $transitions.onSuccess({ to: "**.transactions.transaction" }, (transition: angular.ui.IState): void => this.transitionSuccessHandler(Number(transition.params("to").transactionId))) as () => void);

		// Auto scroll to the bottom
		$timeout((): void => ogViewScrollService.scrollTo("bottom")).catch(this.showError);
	}

	// Fetch a batch of transactions
	public getTransactions(direction: TransactionFetchDirection, fromDate?: Date, transactionIdToFocus?: number): void {
		let transactionFetch: angular.IPromise<TransactionBatch>,
				getFromDate: Date | undefined = fromDate;

		// Show the loading spinner
		this.loading[direction] = true;

		if (undefined === getFromDate) {
			const fromIndex: number = "prev" === direction ? 0 : this.transactions.length - 1;

			// Get the from date (depending on which direction we're fetching)
			if (undefined !== this.transactions[fromIndex] as Transaction | undefined) {
				getFromDate = this.transactions[fromIndex].transaction_date as Date;
			}
		}

		if (undefined === this.contextType) {
			// Search for transactions matching the query
			transactionFetch = this.transactionModel.query(this.context as string, getFromDate as Date, direction);
		} else {
			// Get all transactions for the context
			transactionFetch = this.transactionModel.all((this.contextModel as EntityModel).path((this.context as Entity).id), getFromDate as Date, direction, this.unreconciledOnly);
		}

		transactionFetch.then((transactionBatch: TransactionBatch): void => {
			// Process the transaction batch
			this.processTransactions(transactionBatch, getFromDate, transactionIdToFocus);

			// Hide spinner
			this.loading[direction] = false;
		}).catch(this.showError);
	}

	// Toggles the show all details flag
	public toggleShowAllDetails(showAllDetails: boolean): void {
		// Store the setting
		this.transactionModel.showAllDetails(showAllDetails);
		this.showAllDetails = showAllDetails;
	}

	// Toggles the unreconciled only flag
	public toggleUnreconciledOnly(unreconciledOnly: boolean, direction: TransactionFetchDirection, fromDate?: Date, transactionIdToFocus?: number): void {
		if (!this.reconciling) {
			// Store the setting for the current account
			this.accountModel.unreconciledOnly(Number((this.context as Entity).id), unreconciledOnly);
			this.unreconciledOnly = unreconciledOnly;
			this.transactions = [];
			this.getTransactions(direction, fromDate, transactionIdToFocus);
		}
	}

	// Updates all cleared transactions to reconciled
	public save(): void {
		this.accountModel.reconcile(Number((this.context as Entity).id)).then((): void => {
			// Remove the closing balance from local storage
			this.$window.localStorage.removeItem(`lootClosingBalance-${(this.context as Entity).id}`);

			// Exit reconcile mode
			this.reconciling = false;

			// Refresh the transaction list
			this.transactions = [];
			this.getTransactions("prev");
		}).catch(this.showError);
	}

	// Cancels the reconciliation process
	public cancel(): void {
		this.reconciling = false;
	}

	// Launches the account reconciliation process
	public reconcile(): void {
		if (!this.reconciling) {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: AccountReconcileView,
				controller: "AccountReconcileController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm",
				resolve: {
					account: (): Entity => this.context as Entity
				}
			}).result
				.then((closingBalance: number): void => {
					const decimalPlaces = 2;

					// Make the closing balance available on the scope and set the reconcile target
					this.closingBalance = closingBalance;

					// Refresh the account to ensure we have the latest balances
					this.accountModel.flush((this.context as Entity).id);
					this.accountModel.find(Number((this.context as Entity).id)).then((account: Account): void => {
						this.reconcileTarget = Number((this.closingBalance - account.reconciled_closing_balance).toFixed(decimalPlaces));
						this.clearedTotal = Number(account.cleared_closing_balance.toFixed(decimalPlaces));
						this.unclearedTotal = Number((this.reconcileTarget - this.clearedTotal).toFixed(decimalPlaces));

						// Refresh the list with only unreconciled transactions
						this.toggleUnreconciledOnly(true, "prev");

						// Switch to reconcile mode
						this.reconciling = true;
					}).catch(this.showError);
				})
				.finally((): true => (this.ogTableNavigableService.enabled = true))
				.catch(this.showError);
		}
	}

	// Toggles a transaction as cleared
	public toggleCleared(transaction: Transaction): void {
		this.transactionModel.updateStatus((this.contextModel as EntityModel).path((this.context as Entity).id), Number(transaction.id), transaction.status)
			.then((): void => this.updateReconciledTotals(transaction))
			.catch(this.showError);
	}

	// Shows/hides subtransactions
	public toggleSubtransactions($event: Event, transaction: SplitTransaction): void {
		// Toggle the show flag
		transaction.showSubtransactions = !transaction.showSubtransactions;

		// If we’re showing
		if (transaction.showSubtransactions) {
			// Show the loading indicator
			transaction.loadingSubtransactions = true;

			// Clear the array
			transaction.subtransactions = [];

			// Resolve the subtransactions
			this.transactionModel.findSubtransactions(Number(transaction.id)).then((subtransactions: SplitTransactionChild[]): void => {
				transaction.subtransactions = subtransactions;

				// Hide the loading indicator
				transaction.loadingSubtransactions = false;
			}).catch(this.showError);
		}

		$event.cancelBubble = true;
	}

	// Switch to the other side of a transaction
	public switchAccount($event: Event | null, transaction: TransferrableTransaction): void {
		this.switchToAccount($event, Number((transaction.account as Entity).id), transaction as Transaction);
	}

	// Switch to the primary account of a transaction
	public switchPrimaryAccount($event: Event | null, transaction: Transaction): void {
		this.switchToAccount($event, Number(transaction.primary_account.id), transaction);
	}

	// Switch to the transaction's payee
	public switchPayee($event: Event, transaction: PayeeCashTransaction): void {
		this.switchTo($event, "payees.payee", Number((transaction.payee as Entity).id), transaction as Transaction);
	}

	// Switch to the transaction's security
	public switchSecurity($event: Event, transaction: SecurityTransaction): void {
		this.switchTo($event, "securities.security", Number((transaction.security as Entity).id), transaction as Transaction);
	}

	// Switch to the transaction's category
	public switchCategory($event: Event, transaction: CategorisableTransaction): void {
		this.switchTo($event, "categories.category", Number((transaction.category as Entity).id), transaction as Transaction);
	}

	// Switch to the transaction's subcategory
	public switchSubcategory($event: Event, transaction: SubcategorisableTransaction): void {
		this.switchTo($event, "categories.category", Number((transaction.subcategory as Entity).id), transaction as Transaction);
	}

	private editTransaction(index?: number): void {
		// Helper function to sort by transaction date, then by transaction id
		function byTransactionDateAndId(a: Transaction, b: Transaction): number {
			let x: Date | number, y: Date | number;

			if (isEqual(a.transaction_date as Date, b.transaction_date as Date)) {
				x = Number(a.id);
				y = Number(b.id);
			} else {
				x = a.transaction_date as Date;
				y = b.transaction_date as Date;
			}

			return x < y ? -1 : x > y ? 1 : 0;
		}

		// Abort if the transaction can't be edited
		if (!isNaN(Number(index)) && !this.isAllowed("edit", this.transactions[Number(index)])) {
			return;
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: TransactionEditView,
			controller: "TransactionEditController",
			controllerAs: "vm",
			backdrop: "static",
			size: "lg",
			resolve: {
				transaction: (): angular.IPromise<Transaction> | Partial<SecurityTransaction | Transaction> | Transaction => {
					// If we didn't get an index, we're adding a new transaction
					if (isNaN(Number(index))) {
						if ("security" === this.contextType) {
							const newSecurityTransaction: Partial<SecurityTransaction> = {
								transaction_type: "SecurityHolding",
								transaction_date: this.transactionModel.lastTransactionDate,
								security: this.context as Security
							};

							return newSecurityTransaction;
						}

						const newTransaction: Partial<Transaction> = {
							transaction_type: "Basic",
							transaction_date: this.transactionModel.lastTransactionDate
						};

						switch (this.contextType) {
							case "account":
								newTransaction.primary_account = this.context as Account;
								break;

							case "payee":
								newTransaction.payee = this.context as Payee;
								break;

							case "category":
								newTransaction.category = (this.context as Category).parent ?? this.context as Category;
								newTransaction.subcategory = undefined === (this.context as Category).parent || null === (this.context as Category).parent ? null : this.context as Category;
								break;

							default:
						}

						return newTransaction;
					}

					// If the selected transaction is a Split/Loan Repayment/Payslip; fetch the subtransactions first
					switch (this.transactions[Number(index)].transaction_type) {
						case "Split":
						case "LoanRepayment":
						case "Payslip":
							(this.transactions[Number(index)] as SplitTransaction).subtransactions = [];

							return this.transactionModel.findSubtransactions(Number(this.transactions[Number(index)].id)).then((subtransactions: SplitTransactionChild[]): Transaction => {
								(this.transactions[Number(index)] as SplitTransaction).subtransactions = subtransactions;

								return this.transactions[Number(index)];
							});
						default:
							return this.transactions[Number(index)];
					}
				}
			}
		}).result
			.then((transaction: Transaction): void => {
				// If the context has changed, remove the transaction from the array
				if (this.contextChanged(transaction)) {
					this.removeTransaction(Number(index));
				} else {
					// Update the closing balance
					this.updateClosingBalance(this.transactions[Number(index)], transaction);

					if (!isAfter(transaction.transaction_date as Date, this.firstTransactionDate)) {
						// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
						this.getTransactions("next", subDays(transaction.transaction_date as Date, 1), Number(transaction.id));
					} else if (!isBefore(transaction.transaction_date as Date, this.lastTransactionDate) && !this.atEnd) {
						// Transaction date is later than the latest fetched transaction, refresh from the new date
						this.getTransactions("prev", addDays(transaction.transaction_date as Date, 1), Number(transaction.id));
					} else {
						// Transaction date is within the boundaries of the fetched range (or we've fetched to the end)
						if (isNaN(Number(index))) {
							// Add new transaction to the end of the array
							this.transactions.push(transaction);
						} else {
							// Update the existing transaction in the array
							this.transactions[Number(index)] = transaction;
						}

						// Resort the array
						this.transactions.sort(byTransactionDateAndId);

						// Recalculate the running balances
						this.updateRunningBalances();

						// Refocus the transaction
						this.focusTransaction(Number(transaction.id));
					}
				}
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	private contextChanged(transaction: Transaction): boolean {
		let currentContext: Entity | null | undefined;

		// Check if the transaction still matches the context
		switch (this.contextType) {
			case "account":
				currentContext = transaction.primary_account;
				break;

			case "payee":
				currentContext = (transaction as PayeeCashTransaction).payee as Payee;
				break;

			case "security":
				currentContext = (transaction as SecurityTransaction).security as Security;
				break;

			case "category":
				currentContext = (undefined === (this.context as Category).parent || null === (this.context as Category).parent ? transaction.category : (transaction as SubcategorisableTransaction).subcategory) as Category | null | undefined;
				break;

			// Search mode - check if the transaction memo still matches the search query
			default:
				return -1 === transaction.memo.toLowerCase().indexOf(String(this.context).toLowerCase());
		}

		return undefined === currentContext || null === currentContext ? false : currentContext.id !== (this.context as Entity).id;
	}

	private deleteTransaction(index: number): void {
		// Abort if the transaction can't be deleted
		if (!this.isAllowed("delete", this.transactions[index])) {
			return;
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: TransactionDeleteView,
			controller: "TransactionDeleteController",
			controllerAs: "vm",
			backdrop: "static",
			resolve: {
				transaction: (): Transaction => this.transactions[index]
			}
		}).result
			.then((): void => this.removeTransaction(index))
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	// Removes a transaction from the list
	private removeTransaction(index: number): void {
		// Update the context's closing balance
		this.updateClosingBalance(this.transactions[index]);

		// Splice the transaction from the array
		this.transactions.splice(index, 1);

		// If the transaction was focused, transition to the parent state
		if (this.$state.includes("**.transaction")) {
			this.$state.go("^").catch(this.showError);
		}
	}

	// Updates the context's closing balance after adding, editing or deleting a transaction
	private updateClosingBalance(originalTransaction?: Transaction, newTransaction?: Transaction): void {
		// Only proceed if the context has a closing balance (ie. not in search mode)
		if ("object" === typeof this.context && Object.getOwnPropertyDescriptor(this.context, "closing_balance")) {
			// If there was an original transaction, exclude it's amount from the closing balance
			if (undefined !== originalTransaction) {
				this.context.closing_balance = Number(this.context.closing_balance) - (Number((originalTransaction as CashTransaction).amount) * ("inflow" === originalTransaction.direction ? 1 : -1));
			}

			// If there is a new transaction, include it's amount in the closing balance
			if (undefined !== newTransaction) {
				this.context.closing_balance = Number(this.context.closing_balance) + (Number((newTransaction as CashTransaction).amount) * ("inflow" === newTransaction.direction ? 1 : -1));
			}
		}
	}

	// Returns true if the action is allowed for the transaction
	private isAllowed(action: "delete" | "edit", transaction: SplitTransactionChild | Transaction): boolean {
		let	allowed = true,
				message = "";

		// Check if the action is allowed
		switch (transaction.transaction_type) {
			case "Sub":
			case "Subtransfer":
				allowed = false;
				message = `This transaction is part of a split transaction. You can only ${action} it from the parent account. Would you like to switch to the parent account now?`;
				break;

			case "Dividend":
			case "SecurityInvestment":
				if ("investment" !== transaction.primary_account.account_type.toLowerCase() && "edit" === action) {
					allowed = false;
					message = `This is an investment transaction. You can only ${action} it from the investment account. Would you like to switch to the investment account now?`;
				}
				break;

			default:
		}

		// If the action is not allowed, show the confirmation prompt
		if (!allowed) {
			this.promptToSwitchAccounts(message, transaction);
		}

		return allowed;
	}

	private promptToSwitchAccounts(message: string, transaction: SplitTransactionChild | Transaction): void {
		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: OgModalConfirmView,
			controller: "OgModalConfirmController",
			controllerAs: "vm",
			backdrop: "static",
			resolve: {
				confirm: (): OgModalConfirm => ({
					header: "Switch account?",
					message
				})
			}
		}).result
			.then((): void => {
				// Switch to the other account
				if (null !== (transaction as TransferrableTransaction).account && Number(((transaction as TransferrableTransaction).account as Account).id)) {
					this.switchAccount(null, transaction as TransferrableTransaction);
				} else {
					this.switchPrimaryAccount(null, transaction as Transaction);
				}
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	// Processes a batch of transactions
	private processTransactions(transactionBatch: TransactionBatch, fromDate?: Date, transactionIdToFocus?: number): void {
		if (transactionBatch.transactions.length) {
			// Store the opening balance & transactions
			this.openingBalance = transactionBatch.openingBalance;
			this.transactions = transactionBatch.transactions;
			this.atEnd = transactionBatch.atEnd || undefined === fromDate;

			// Get the boundaries of the current transaction date range
			this.firstTransactionDate = transactionBatch.transactions[0].transaction_date as Date;
			this.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length - 1].transaction_date as Date;

			// Update the running balances
			this.updateRunningBalances();

			// Focus on the specified transaction (if provided)
			if (!isNaN(Number(transactionIdToFocus))) {
				this.focusTransaction(Number(transactionIdToFocus));
			}
		}
	}

	// Updates the running balance of all transactions
	private updateRunningBalances(): void {
		// Do nothing for investment accounts
		if (undefined !== (this.context as Account).account_type as AccountType | undefined && "investment" === (this.context as Account).account_type.toLowerCase()) {
			return;
		}

		this.transactions.reduce((openingBalance: number, transaction: Transaction): number => {
			transaction.balance = openingBalance + ((transaction as CashTransaction).amount * ("inflow" === transaction.direction ? 1 : -1));

			return transaction.balance;
		}, this.openingBalance);
	}

	// Finds a specific transaction and focusses that row in the table
	private focusTransaction(transactionIdToFocus: number): number {
		const delay = 50;
		let targetIndex = NaN;

		// Find the transaction by it's id
		angular.forEach(this.transactions, (transaction: Transaction, index: number): void => {
			if (isNaN(targetIndex) && transaction.id === transactionIdToFocus) {
				targetIndex = index;
			}
		});

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout((): void => (this.tableActions as OgTableActionHandlers).focusRow(targetIndex), delay).catch(this.showError);
		}

		return targetIndex;
	}

	// Helper function to calculate the total cleared/uncleared totals
	private updateReconciledTotals(transaction: Transaction): void {
		const decimalPlaces = 2;

		// Start with the transaction amount if it is an inflow, or the inverse if it is an outflow
		let amount = (transaction as CashTransaction).amount * ("inflow" === transaction.direction ? 1 : -1);

		// Invert again if the transction is not cleared
		if ("Cleared" !== transaction.status) {
			amount *= -1;
		}

		// Adjust the cleared total by the amount
		this.clearedTotal += Number(amount.toFixed(decimalPlaces));

		// Uncleared total is the target less the cleared total
		this.unclearedTotal = Number((this.reconcileTarget - this.clearedTotal).toFixed(decimalPlaces));
	}

	// Helper function for switching states
	private switchTo($event: Event | null, state: string, id: number, transaction: SplitTransactionChild | Transaction): void {
		/*
		 * For Subtransactions, don't switch to the parent
		 * (only applies when switching between Category <=> Subcategory transaction lists)
		 */
		if ("Sub" === transaction.transaction_type) {
			(transaction as Subtransaction).parent_id = null;
		}

		const parentId = (transaction as SplitTransactionChild).parent_id;

		this.$state.go(`root.${state}.transactions.transaction`, {
			id,
			transactionId: parentId ?? transaction.id
		}).catch(this.showError);

		if (null !== $event) {
			$event.stopPropagation();
		}
	}

	private switchToAccount($event: Event | null, id: number, transaction: SplitTransactionChild | Transaction): void {
		// If the transaction is reconciled, make sure the account we're switching to shows reconciled transactions
		if ("Reconciled" === (transaction as Transaction).status) {
			this.accountModel.unreconciledOnly(id, false);
		}

		this.switchTo($event, "accounts.account", id, transaction);
	}

	// Ensure that the specified transaction is in the current set, and the row is focussed
	private transitionSuccessHandler(transactionId: number): void {
		if (isNaN(this.focusTransaction(transactionId))) {
			// Transaction was not found in the current set

			// Get the transaction details from the server
			this.transactionModel.find(transactionId)
				.then((transaction: Transaction): void => {
					let	fromDate: Date = transaction.transaction_date as Date,
							direction: TransactionFetchDirection = "next";

					if (!isAfter(transaction.transaction_date as Date, this.firstTransactionDate)) {
						// Transaction date is earlier than the earliest fetched transaction
						fromDate = subDays(transaction.transaction_date as Date, 1);
						direction = "next";
					} else if (!isBefore(transaction.transaction_date as Date, this.lastTransactionDate) && !this.atEnd) {
						// Transaction date is later than the latest fetched transaction
						fromDate = addDays(transaction.transaction_date as Date, 1);
						direction = "prev";
					}

					if (this.unreconciledOnly) {
						// If we're not already showing reconciled transactions, toggle the setting
						this.toggleUnreconciledOnly(false, direction, fromDate, transactionId);
					} else {
						// Otherwise just get refresh the transactions from the new date
						this.getTransactions(direction, fromDate, transactionId);
					}
				})
				.catch(this.showError);
		}
	}
}

TransactionIndexController.$inject = ["$scope", "$transitions", "$uibModal", "$timeout", "$window", "$state", "transactionModel", "accountModel", "ogTableNavigableService", "ogViewScrollService", "ogModalErrorService", "contextModel", "context", "transactionBatch"];