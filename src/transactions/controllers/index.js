{
	/**
	 * Implementation
	 */
	class TransactionIndexController {
		constructor($scope, $uibModal, $timeout, $window, $state, transactionModel, accountModel, ogTableNavigableService, ogViewScrollService, contextModel, context, transactionBatch) {
			const self = this;

			this.$uibModal = $uibModal;
			this.$timeout = $timeout;
			this.$window = $window;
			this.$state = $state;
			this.transactionModel = transactionModel;
			this.accountModel = accountModel;
			this.ogTableNavigableService = ogTableNavigableService;
			this.ogViewScrollService = ogViewScrollService;
			this.contextModel = contextModel;
			this.context = context;
			this.transactionBatch = transactionBatch;
			this.contextType = contextModel && contextModel.type;
			this.transactions = [];
			this.firstTransactionDate = null;
			this.lastTransactionDate = null;
			this.atEnd = true;
			this.openingBalance = 0;
			this.closingBalance = 0;
			this.reconcileTarget = 0;
			this.clearedTotal = 0;
			this.unclearedTotal = 0;
			this.reconcilable = "account" === this.contextType;
			this.reconciling = false;
			this.showAllDetails = transactionModel.allDetailsShown();
			this.unreconciledOnly = this.reconcilable && accountModel.isUnreconciledOnly(this.context.id);
			this.loading = {prev: false, next: false};
			this.today = moment().startOf("day").toDate();
			this.tableActions = {
				selectAction(index) {
					if (self.reconciling) {
						// When reconciling, select action is to toggle the cleared status
						const transaction = self.transactions[index];

						transaction.status = "Cleared" === transaction.status ? "" : "Cleared";
						self.toggleCleared(transaction);
					} else {
						// When not reconciling, select action is to edit the transaction
						self.editTransaction(index);
					}
				},
				editAction(index) {
					self.editTransaction(index);
				},
				insertAction() {
					// Same as select action, but don't pass any arguments
					self.editTransaction();
				},
				deleteAction(index) {
					self.deleteTransaction(index);
				},
				focusAction(index) {
					$state.go(`${$state.includes("**.transaction") ? "^" : ""}.transaction`, {transactionId: self.transactions[index].id});
				}
			};

			// Process the initial batch of transactions to display
			this.processTransactions(transactionBatch, null, Number(this.$state.params.transactionId));

			// Handler is wrapped in a function to aid with unit testing
			$scope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => this.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams));

			// Auto scroll to the bottom
			$timeout(() => ogViewScrollService.scrollTo("bottom"));
		}

		editTransaction(index) {
			// Helper function to sort by transaction date, then by transaction id
			function byTransactionDateAndId(a, b) {
				let x, y;

				if (moment(a.transaction_date).isSame(b.transaction_date)) {
					x = a.id;
					y = b.id;
				} else {
					x = a.transaction_date;
					y = b.transaction_date;
				}

				return x < y ? -1 : x > y ? 1 : 0;
			}

			// Abort if the transaction can't be edited
			if (!isNaN(index) && !this.isAllowed("edit", this.transactions[index])) {
				return;
			}

			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "transactions/views/edit.html",
				controller: "TransactionEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "lg",
				resolve: {
					transaction: () => {
						// If we didn't get an index, we're adding a new transaction
						if (isNaN(index)) {
							return {
								transaction_type: "Basic",
								transaction_date: this.transactionModel.lastTransactionDate,
								primary_account: "account" === this.contextType ? this.context : null,
								payee: "payee" === this.contextType ? this.context : null,
								security: "security" === this.contextType ? this.context : null,
								category: "category" === this.contextType ? this.context.parent ? this.context.parent : this.context : null,
								subcategory: "category" === this.contextType && this.context.parent ? this.context : null
							};
						}

						// If the selected transaction is a Split/Loan Repayment/Payslip; fetch the subtransactions first
						switch (this.transactions[index].transaction_type) {
							case "Split":
							case "LoanRepayment":
							case "Payslip":
								this.transactions[index].subtransactions = [];
								return this.transactionModel.findSubtransactions(this.transactions[index].id).then(subtransactions => {
									this.transactions[index].subtransactions = subtransactions;
									return this.transactions[index];
								});
							default:
								return this.transactions[index];
						}
					}
				}
			}).result.then(transaction => {
				// If the context has changed, remove the transaction from the array
				if (this.contextChanged(transaction)) {
					this.removeTransaction(index);
				} else {
					// Update the closing balance
					this.updateClosingBalance(this.transactions[index], transaction);

					const fromDate = moment(transaction.transaction_date);

					if (!fromDate.isAfter(this.firstTransactionDate)) {
						// Transaction date is earlier than the earliest fetched transaction, refresh from the new date
						this.getTransactions("next", fromDate.subtract(1, "days").toDate(), transaction.id);
					} else if (!fromDate.isBefore(this.lastTransactionDate) && !this.atEnd) {
						// Transaction date is later than the latest fetched transaction, refresh from the new date
						this.getTransactions("prev", fromDate.add(1, "days").toDate(), transaction.id);
					} else {
						// Transaction date is within the boundaries of the fetched range (or we've fetched to the end)
						if (isNaN(index)) {
							// Add new transaction to the end of the array
							this.transactions.push(transaction);
						} else {
							// Update the existing transaction in the array
							this.transactions[index] = transaction;
						}

						// Resort the array
						this.transactions.sort(byTransactionDateAndId);

						// Recalculate the running balances
						this.updateRunningBalances();

						// Refocus the transaction
						this.focusTransaction(transaction.id);
					}
				}
			}).finally(() => this.ogTableNavigableService.enabled = true);
		}

		contextChanged(transaction) {
			let currentContext;

			// Check if the transaction still matches the context
			switch (this.contextType) {
				case "account":
					currentContext = transaction.primary_account;
					break;

				case "payee":
					currentContext = transaction.payee;
					break;

				case "security":
					currentContext = transaction.security;
					break;

				case "category":
					currentContext = this.context.parent ? transaction.subcategory : transaction.category;
					break;

				default:

					// Search mode - check if the transaction memo still matches the search query
					return -1 === transaction.memo.toLowerCase().indexOf(this.context.toLowerCase());
			}

			return currentContext.id !== this.context.id;
		}

		deleteTransaction(index) {
			// Abort if the transaction can't be deleted
			if (!this.isAllowed("delete", this.transactions[index])) {
				return;
			}

			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "transactions/views/delete.html",
				controller: "TransactionDeleteController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					transaction: () => this.transactions[index]
				}
			}).result.then(() => this.removeTransaction(index)).finally(() => this.ogTableNavigableService.enabled = true);
		}

		// Removes a transaction from the list
		removeTransaction(index) {
			// Update the context's closing balance
			this.updateClosingBalance(this.transactions[index]);

			// Splice the transaction from the array
			this.transactions.splice(index, 1);

			// If the transaction was focused, transition to the parent state
			if (this.$state.includes("**.transaction")) {
				this.$state.go("^");
			}
		}

		// Updates the context's closing balance after adding, editing or deleting a transaction
		updateClosingBalance(originalTransaction, newTransaction) {
			// Only proceed if the context has a closing balance (ie. not in search mode)
			if (this.context.hasOwnProperty("closing_balance")) {
				// If there was an original transaction, exclude it's amount from the closing balance
				if (originalTransaction) {
					this.context.closing_balance = Number(this.context.closing_balance) - Number(originalTransaction.amount) * ("inflow" === originalTransaction.direction ? 1 : -1);
				}

				// If there is a new transaction, include it's amount in the closing balance
				if (newTransaction) {
					this.context.closing_balance = Number(this.context.closing_balance) + Number(newTransaction.amount) * ("inflow" === newTransaction.direction ? 1 : -1);
				}
			}
		}

		// Returns true if the action is allowed for the transaction
		isAllowed(action, transaction) {
			let	allowed = true,
					message;

			// Check if the action is allowed
			switch (transaction.transaction_type) {
				case "Sub":
				case "Subtransfer":
					allowed = false;
					message = `This transaction is part of a split transaction. You can only ${action} it from the parent account. Would you like to switch to the parent account now?`;
					break;

				case "Dividend":
				case "SecurityInvestment":
					if ("investment" !== transaction.primary_account.account_type && "edit" === action) {
						allowed = false;
						message = `This is an investment transaction. You can only ${action} it from the investment account. Would you like to switch to the investment account now?`;
					}
					break;

				// no default
			}

			// If the action is not allowed, show the confirmation prompt
			if (!allowed) {
				this.promptToSwitchAccounts(message, transaction);
			}

			return allowed;
		}

		promptToSwitchAccounts(message, transaction) {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "og-components/og-modal-confirm/views/confirm.html",
				controller: "OgModalConfirmController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					confirm: () => ({
						header: "Switch account?",
						message
					})
				}
			}).result.then(() => {
				// Switch to the other account
				if (transaction.account && transaction.account.id) {
					this.switchAccount(null, transaction);
				} else {
					this.switchPrimaryAccount(null, transaction);
				}
			}).finally(() => this.ogTableNavigableService.enabled = true);
		}

		// Fetch a batch of transactions
		getTransactions(direction, fromDate, transactionIdToFocus) {
			let transactionFetch,
					getFromDate = fromDate;

			// Show the loading spinner
			this.loading[direction] = true;

			if (!getFromDate) {
				const fromIndex = "prev" === direction ? 0 : this.transactions.length - 1;

				// Get the from date (depending on which direction we're fetching)
				if (this.transactions[fromIndex]) {
					getFromDate = this.transactions[fromIndex].transaction_date;
				}
			}

			if (this.contextType) {
				// Get all transactions for the context
				transactionFetch = this.transactionModel.all(this.contextModel.path(this.context.id), getFromDate, direction, this.unreconciledOnly);
			} else {
				// Search for transactions matching the query
				transactionFetch = this.transactionModel.query(this.context, getFromDate, direction);
			}

			transactionFetch.then(transactionBatch => {
				// Process the transaction batch
				this.processTransactions(transactionBatch, getFromDate, transactionIdToFocus);

				// Hide spinner
				this.loading[direction] = false;
			});
		}

		// Processes a batch of transactions
		processTransactions(transactionBatch, fromDate, transactionIdToFocus) {
			if (transactionBatch.transactions.length > 0) {
				// Store the opening balance & transactions
				this.openingBalance = transactionBatch.openingBalance;
				this.transactions = transactionBatch.transactions;
				this.atEnd = transactionBatch.atEnd || !fromDate;

				// Get the boundaries of the current transaction date range
				this.firstTransactionDate = transactionBatch.transactions[0].transaction_date;
				this.lastTransactionDate = transactionBatch.transactions[transactionBatch.transactions.length - 1].transaction_date;

				// Update the running balances
				this.updateRunningBalances();

				// Focus on the specified transaction (if provided)
				if (!isNaN(transactionIdToFocus)) {
					this.focusTransaction(transactionIdToFocus);
				}

				// Update the reconciled amounts if in reconcile mode
				if (this.reconciling) {
					this.updateReconciledTotals();
				}
			}
		}

		// Updates the running balance of all transactions
		updateRunningBalances() {
			// Do nothing for investment accounts
			if ("investment" === this.context.account_type) {
				return;
			}

			this.transactions.reduce((openingBalance, transaction) => {
				transaction.balance = openingBalance + transaction.amount * ("inflow" === transaction.direction ? 1 : -1);
				return transaction.balance;
			}, this.openingBalance);
		}

		// Finds a specific transaction and focusses that row in the table
		focusTransaction(transactionIdToFocus) {
			const delay = 50;
			let targetIndex;

			// Find the transaction by it's id
			angular.forEach(this.transactions, (transaction, index) => {
				if (isNaN(targetIndex) && transaction.id === transactionIdToFocus) {
					targetIndex = index;
				}
			});

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				this.$timeout(() => this.tableActions.focusRow(targetIndex), delay);
			}

			return targetIndex;
		}

		// Toggles the show all details flag
		toggleShowAllDetails(showAllDetails) {
			// Store the setting
			this.transactionModel.showAllDetails(showAllDetails);
			this.showAllDetails = showAllDetails;
		}

		// Toggles the unreconciled only flag
		toggleUnreconciledOnly(unreconciledOnly, direction, fromDate, transactionIdToFocus) {
			if (!this.reconciling) {
				// Store the setting for the current account
				this.accountModel.unreconciledOnly(this.context.id, unreconciledOnly);
				this.unreconciledOnly = unreconciledOnly;
				this.transactions = [];
				this.getTransactions(direction || "prev", fromDate, transactionIdToFocus);
			}
		}

		// Updates all cleared transactions to reconciled
		save() {
			this.accountModel.reconcile(this.context.id).then(() => {
				// Remove the closing balance from local storage
				this.$window.localStorage.removeItem(`lootClosingBalance-${this.context.id}`);

				// Exit reconcile mode
				this.reconciling = false;

				// Refresh the transaction list
				this.transactions = [];
				this.getTransactions("prev");
			});
		}

		// Cancels the reconciliation process
		cancel() {
			this.reconciling = false;
		}

		// Launches the account reconciliation process
		reconcile() {
			if (!this.reconciling) {
				// Disable navigation on the table
				this.ogTableNavigableService.enabled = false;

				// Show the modal
				this.$uibModal.open({
					templateUrl: "accounts/views/reconcile.html",
					controller: "AccountReconcileController",
					controllerAs: "vm",
					backdrop: "static",
					size: "sm",
					resolve: {
						account: () => this.context
					}
				}).result.then(closingBalance => {
					// Make the closing balance available on the scope
					this.closingBalance = closingBalance;

					// Refresh the list with only unreconciled transactions
					this.toggleUnreconciledOnly(true);

					// Switch to reconcile mode
					this.reconciling = true;
				}).finally(() => this.ogTableNavigableService.enabled = true);
			}
		}

		// Helper function to calculate the total cleared/uncleared totals
		updateReconciledTotals() {
			const decimalPlaces = 2;

			// Target is the closing balance, minus the opening balance
			this.reconcileTarget = Number((this.closingBalance - this.openingBalance).toFixed(decimalPlaces));

			// Cleared total is the sum of all transaction amounts that are cleared
			this.clearedTotal = this.transactions.reduce((clearedAmount, transaction) => {
				let clearedTotal = clearedAmount;

				if ("Cleared" === transaction.status) {
					clearedTotal += transaction.amount * ("inflow" === transaction.direction ? 1 : -1);
				}

				return Number(clearedTotal.toFixed(decimalPlaces));
			}, 0);

			// Uncleared total is the target less the cleared total
			this.unclearedTotal = Number((this.reconcileTarget - this.clearedTotal).toFixed(decimalPlaces));
		}

		// Toggles a transaction as cleared
		toggleCleared(transaction) {
			this.transactionModel.updateStatus(this.contextModel.path(this.context.id), transaction.id, transaction.status).then(() => this.updateReconciledTotals());
		}

		// Shows/hides subtransactions
		toggleSubtransactions($event, transaction) {
			// Toggle the show flag
			transaction.showSubtransactions = !transaction.showSubtransactions;

			// If we’re showing
			if (transaction.showSubtransactions) {
				// Show the loading indicator
				transaction.loadingSubtransactions = true;

				// Clear the array
				transaction.subtransactions = [];

				// Resolve the subtransactions
				this.transactionModel.findSubtransactions(transaction.id).then(subtransactions => {
					transaction.subtransactions = subtransactions;

					// Hide the loading indicator
					transaction.loadingSubtransactions = false;
				});
			}

			$event.cancelBubble = true;
		}

		// Opens the flag transaction dialog
		flag(index) {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "transactions/views/flag.html",
				controller: "TransactionFlagController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm",
				resolve: {
					transaction: () => this.transactions[index]
				}
			}).result.then(transaction => this.transactions[index] = transaction).finally(() => this.ogTableNavigableService.enabled = true);
		}

		// Helper function for switching states
		switchTo($event, state, id, transaction) {
			// For Subtransactions, don't switch to the parent
			// (only applies when switching between Category <=> Subcategory transaction lists)
			if ("Sub" === transaction.transaction_type) {
				transaction.parent_id = null;
			}

			this.$state.go(`root.${state}.transactions.transaction`, {
				id,
				transactionId: transaction.parent_id || transaction.id
			});

			if ($event) {
				$event.stopPropagation();
			}
		}

		switchToAccount($event, id, transaction) {
			// If the transaction is reconciled, make sure the account we're switching to shows reconciled transactions
			if ("Reconciled" === transaction.status) {
				this.accountModel.unreconciledOnly(id, false);
			}

			this.switchTo($event, "accounts.account", id, transaction);
		}

		// Switch to the other side of a transaction
		switchAccount($event, transaction) {
			this.switchToAccount($event, transaction.account.id, transaction);
		}

		// Switch to the primary account of a transaction
		switchPrimaryAccount($event, transaction) {
			this.switchToAccount($event, transaction.primary_account.id, transaction);
		}

		// Switch to the transaction's payee
		switchPayee($event, transaction) {
			this.switchTo($event, "payees.payee", transaction.payee.id, transaction);
		}

		// Switch to the transaction's security
		switchSecurity($event, transaction) {
			this.switchTo($event, "securities.security", transaction.security.id, transaction);
		}

		// Switch to the transaction's category
		switchCategory($event, transaction) {
			this.switchTo($event, "categories.category", transaction.category.id, transaction);
		}

		// Switch to the transaction's subcategory
		switchSubcategory($event, transaction) {
			this.switchTo($event, "categories.category", transaction.subcategory.id, transaction);
		}

		// Listen for state change events, and when the transactionId or id parameters change, ensure the row is focussed
		stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.transactionId && (toParams.transactionId !== fromParams.transactionId || toParams.id !== fromParams.id)) {
				if (isNaN(this.focusTransaction(Number(toParams.transactionId)))) {
					// Transaction was not found in the current set

					// Get the transaction details from the server
					this.transactionModel.find(toParams.transactionId).then(transaction => {
						let	fromDate = moment(transaction.transaction_date),
								direction;

						if (!fromDate.isAfter(this.firstTransactionDate)) {
							// Transaction date is earlier than the earliest fetched transaction
							fromDate = fromDate.subtract(1, "day");
							direction = "next";
						} else if (!fromDate.isBefore(this.lastTransactionDate) && !this.atEnd) {
							// Transaction date is later than the latest fetched transaction
							fromDate = fromDate.add(1, "day");
							direction = "prev";
						}

						fromDate = fromDate.toDate();

						if (this.unreconciledOnly) {
							// If we're not already showing reconciled transactions, toggle the setting
							this.toggleUnreconciledOnly(false, direction, fromDate, Number(toParams.transactionId));
						} else {
							// Otherwise just get refresh the transactions from the new date
							this.getTransactions(direction, fromDate, Number(toParams.transactionId));
						}
					});
				}
			}
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionIndexController", TransactionIndexController);

	/**
	 * Dependencies
	 */
	TransactionIndexController.$inject = ["$scope", "$uibModal", "$timeout", "$window", "$state", "transactionModel", "accountModel", "ogTableNavigableService", "ogViewScrollService", "contextModel", "context", "transactionBatch"];
}
