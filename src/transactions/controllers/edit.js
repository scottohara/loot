{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($scope, $modalInstance, $q, $timeout, filterFilter, limitToFilter, currencyFilter, payeeModel, securityModel, categoryModel, accountModel, transactionModel, transaction) {
			this.$modalInstance = $modalInstance;
			this.$q = $q;
			this.$timeout = $timeout;
			this.filterFilter = filterFilter;
			this.limitToFilter = limitToFilter;
			this.currencyFilter = currencyFilter;
			this.payeeModel = payeeModel;
			this.securityModel = securityModel;
			this.categoryModel = categoryModel;
			this.accountModel = accountModel;
			this.transactionModel = transactionModel;
			this.originalTransaction = transaction;
			this.transaction = angular.extend({}, transaction);
			this.mode = transaction.id ? "Edit" : "Add";
			this.loadingLastTransaction = false;
			this.totalAllocated = null;
			this.errorMessage = null;

			// Watch the subtransactions array and recalculate the total allocated
			$scope.$watch(() => this.transaction.subtransactions, () => {
				if (this.transaction.subtransactions) {
					this.totalAllocated = this.transaction.subtransactions.reduce((total, subtransaction) => total + (Number(subtransaction.amount * (subtransaction.direction === this.transaction.direction ? 1 : -1)) || 0), 0);

					// If we're adding a new transaction, join the subtransaction memos and update the parent memo
					if (!this.transaction.id) {
						this.memoFromSubtransactions();
					}
				}
			}, true);

			// Prefetch the payees list so that the cache is populated
			payeeModel.all();
		}

		// List of payees for the typeahead
		payees(filter, limit) {
			return this.payeeModel.all().then(payees => this.limitToFilter(this.filterFilter(payees, {name: filter}), limit));
		}

		// List of securities for the typeahead
		securities(filter, limit) {
			return this.securityModel.all().then(securities => this.limitToFilter(this.filterFilter(securities, {name: filter}), limit));
		}

		// List of categories for the typeahead
		categories(filter, limit, parent, includeSplits) {
			// If a parent was specified but it doesn't have an id, return an empty array
			if (parent && isNaN(parent.id)) {
				return [];
			}

			// If the parent was specified, pass the parent's id
			const parentId = parent ? parent.id : null;

			return this.categoryModel.all(parentId).then(categories => {
				let psuedoCategories = categories;

				// For the category dropdown, include psuedo-categories that change the transaction type
				if (!parent) {
					if (includeSplits) {
						psuedoCategories = [
							{id: "SplitTo", name: "Split To"},
							{id: "SplitFrom", name: "Split From"},
							{id: "Payslip", name: "Payslip"},
							{id: "LoanRepayment", name: "Loan Repayment"}
						].concat(psuedoCategories);
					}

					psuedoCategories = [
						{id: "TransferTo", name: "Transfer To"},
						{id: "TransferFrom", name: "Transfer From"}
					].concat(psuedoCategories);
				}

				return this.limitToFilter(this.filterFilter(psuedoCategories, {name: filter}), limit);
			});
		}

		// List of investment categories for the typeahead
		investmentCategories(filter, limit) {
			const categories = [
				{id: "Buy", name: "Buy"},
				{id: "Sell", name: "Sell"},
				{id: "DividendTo", name: "Dividend To"},
				{id: "AddShares", name: "Add Shares"},
				{id: "RemoveShares", name: "Remove Shares"},
				{id: "TransferTo", name: "Transfer To"},
				{id: "TransferFrom", name: "Transfer From"}
			];

			return this.limitToFilter(this.filterFilter(categories, {name: filter}), limit);
		}

		// Returns true if the passed value is typeof string (and is not empty)
		isString(object) {
			return "string" === typeof object && object.length > 0;
		}

		// Handler for payee changes
		payeeSelected() {
			// If we're adding a new transaction and an existing payee is selected
			if (!this.transaction.id && this.transaction.payee && "object" === typeof this.transaction.payee) {
				// Show the loading indicator
				this.loadingLastTransaction = true;

				// Get the previous transaction for the payee
				this.payeeModel.findLastTransaction(this.transaction.payee.id, this.transaction.primary_account.account_type)
					.then(this.getSubtransactions.bind(this))
					.then(this.useLastTransaction.bind(this))
					.then(() => this.loadingLastTransaction = false);
			}
		}

		// Handler for security changes
		securitySelected() {
			// If we're adding a new transaction and an existing security is selected
			if (!this.transaction.id && this.transaction.security && "object" === typeof this.transaction.security) {
				// Show the loading indicator
				this.loadingLastTransaction = true;

				// Get the previous transaction for the security
				this.securityModel.findLastTransaction(this.transaction.security.id, this.transaction.primary_account.account_type)
					.then(this.getSubtransactions.bind(this))
					.then(this.useLastTransaction.bind(this))
					.then(() => this.loadingLastTransaction = false);
			}
		}

		// Fetches the subtransactions for a transaction
		getSubtransactions(transaction) {
			// If the last transaction was a Split/Loan Repayment/Payslip; fetch the subtransactions
			switch (transaction.transaction_type) {
				case "Split":
				case "LoanRepayment":
				case "Payslip":
					transaction.subtransactions = [];
					return this.transactionModel.findSubtransactions(transaction.id).then(subtransactions => {
						// Strip the subtransaction ids
						transaction.subtransactions = subtransactions.map(subtransaction => {
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
		useLastTransaction(transaction) {
			// Strip the id, transaction date, primary account, status & flag
			Reflect.deleteProperty(transaction, "id");
			Reflect.deleteProperty(transaction, "transaction_date");
			Reflect.deleteProperty(transaction, "primary_account");
			Reflect.deleteProperty(transaction, "status");
			Reflect.deleteProperty(transaction, "related_status");
			Reflect.deleteProperty(transaction, "flag");

			// Merge the last transaction details into the transaction on the scope
			this.transaction = angular.extend(this.transaction, transaction);

			// Depending on which field has focus, re-trigger the focus event handler to format/select the new value
			angular.forEach(angular.element("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo"), field => {
				if (field === document.activeElement) {
					this.$timeout(() => angular.element(field).triggerHandler("focus"));
				}
			});
		}

		// Handler for category changes
		// (index) is the subtransaction index, or null for the main transaction
		categorySelected(index) {
			const	transaction = isNaN(index) ? this.transaction : this.transaction.subtransactions[index];
			let	type,
					direction,
					parentId;

			// Check the category selection
			if (transaction.category && "object" === typeof transaction.category) {
				if (isNaN(index)) {
					switch (transaction.category.id) {
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
							direction = transaction.category.direction;
							break;
					}

					// If we have switched to a Split, Payslip or Loan Repayment and there are currently no subtransactions,
					// create some stubs, copying the current transaction details into the first entry
					switch (type) {
						case "Split":
						case "Payslip":
						case "LoanRepayment":
							if (!transaction.subtransactions) {
								transaction.subtransactions = [
									{
										memo: transaction.memo,
										amount: transaction.amount
									},
									{},
									{},
									{}
								];
							}
							break;

						// no default
					}
				} else {
					switch (transaction.category.id) {
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
							direction = transaction.category.direction;
							break;
					}
				}

				parentId = transaction.category.id;
			}

			// Update the transaction type & direction
			transaction.transaction_type = type || (isNaN(index) ? "Basic" : "Sub");
			transaction.direction = direction || "outflow";

			// Make sure the subcategory is still valid
			if (transaction.subcategory && transaction.subcategory.parent_id !== parentId) {
				transaction.subcategory = null;
			}
		}

		// Handler for investment category changes
		investmentCategorySelected() {
			let	type,
					direction;

			// Check the category selection
			if (this.transaction.category && "object" === typeof this.transaction.category) {
				switch (this.transaction.category.id) {
					case "TransferTo":
						type = "SecurityTransfer";
						direction = "outflow";
						break;

					case "TransferFrom":
						type = "SecurityTransfer";
						direction = "inflow";
						break;

					case "RemoveShares":
						type = "SecurityHolding";
						direction = "outflow";
						break;

					case "AddShares":
						type = "SecurityHolding";
						direction = "inflow";
						break;

					case "Sell":
						type = "SecurityInvestment";
						direction = "outflow";
						break;

					case "Buy":
						type = "SecurityInvestment";
						direction = "inflow";
						break;

					case "DividendTo":
						type = "Dividend";
						direction = "outflow";
						break;

					// no default
				}

				// Update the transaction type & direction
				this.transaction.transaction_type = type;
				this.transaction.direction = direction;
			}
		}

		// Joins the subtransaction memos and updates the parent memo
		memoFromSubtransactions() {
			this.transaction.memo = this.transaction.subtransactions.reduce((memo, subtransaction) => `${memo}${subtransaction.memo ? `${"" === memo ? "" : "; "}${subtransaction.memo}` : ""}`, "");
		}

		// List of accounts for the typeahead
		accounts(filter, limit) {
			return this.accountModel.all().then(accounts => {
				let filteredAccounts = accounts;

				// Exclude investment accounts by default
				const accountFilter = {
					name: filter,
					account_type: "!investment"
				};

				// Filter the current account from the results (can't transfer to self)
				if (this.transaction.primary_account) {
					filteredAccounts = this.filterFilter(filteredAccounts, {name: `!${this.transaction.primary_account.name}`}, true);
				}

				// For security transfers, only include investment accounts
				if ("SecurityTransfer" === this.transaction.transaction_type) {
					accountFilter.account_type = "investment";
				}

				return this.limitToFilter(this.filterFilter(filteredAccounts, accountFilter), limit);
			});
		}

		// Handler for primary account changes
		primaryAccountSelected() {
			if (this.transaction.account && this.transaction.primary_account && this.transaction.primary_account.id === this.transaction.account.id) {
				// Primary account and transfer account can't be the same, so clear the transfer account
				this.transaction.account = null;
			}
		}

		// Add a new subtransaction
		addSubtransaction() {
			this.transaction.subtransactions.push({});
		}

		// Deletes a subtransaction
		deleteSubtransaction(index) {
			this.transaction.subtransactions.splice(index, 1);
		}

		// Adds any unallocated amount to the specified subtransaction
		addUnallocatedAmount(index) {
			this.transaction.subtransactions[index].amount = (Number(this.transaction.subtransactions[index].amount) || 0) + (this.transaction.amount - this.totalAllocated);
		}

		// Updates the transaction amount and memo when the quantity, price or commission change
		updateInvestmentDetails() {
			if ("SecurityInvestment" === this.transaction.transaction_type) {
				// Base amount is the quantity multiplied by the price
				this.transaction.amount = (Number(this.transaction.quantity) || 0) * (Number(this.transaction.price) || 0);

				// For a purchase, commission is added to the cost; for a sale, commission is subtracted from the proceeds
				if ("inflow" === this.transaction.direction) {
					this.transaction.amount += Number(this.transaction.commission) || 0;
				} else {
					this.transaction.amount -= Number(this.transaction.commission) || 0;
				}
			}

			// If we're adding a new buy or sell transaction, update the memo with the details
			if (!this.transaction.id && "SecurityInvestment" === this.transaction.transaction_type) {
				const	quantity = Number(this.transaction.quantity) > 0 ? String(this.transaction.quantity) : "",
							price = Number(this.transaction.price) > 0 ? ` @ ${this.currencyFilter(this.transaction.price)}` : "",
							commission = Number(this.transaction.commission) > 0 ? ` (${"inflow" === this.transaction.direction ? "plus" : "less"} ${this.currencyFilter(this.transaction.commission)} commission)` : "";

				this.transaction.memo = quantity + price + commission;
			}
		}

		// Helper function to invalidate the $http caches after saving a transaction
		invalidateCaches(savedTransaction) {
			// Create a deferred so that we return a promise
			const q = this.$q.defer(),
						models = {
							primary_account: this.accountModel,
							payee: this.payeeModel,
							category: this.categoryModel,
							subcategory: this.categoryModel,
							account: this.accountModel,
							security: this.securityModel
						};

			let	resolve = true,
					originalValue,
					savedValue;

			// Compare each facet of the saved transaction with the original values
			// For any that have changed, invalidate the original from the $http cache
			angular.forEach(Object.keys(models), key => {
				originalValue = this.originalTransaction[key] && this.originalTransaction[key].id || null;
				savedValue = savedTransaction[key] && savedTransaction[key].id || null;

				if (originalValue && originalValue !== savedValue) {
					models[key].flush(originalValue);
				}
			});

			// For subtransactions, we can't be sure if the values have changed or not (as the ordering may have changed)
			// so just invalidate any categories or accounts
			switch (this.originalTransaction.transaction_type) {
				case "Split":
				case "LoanRepayment":
				case "Payslip":

					// Delay resolving the promise
					resolve = false;

					this.transactionModel.findSubtransactions(this.originalTransaction.id).then(subtransactions => {
						angular.forEach(subtransactions, subtransaction => {
							if (subtransaction.category && subtransaction.category.id) {
								this.categoryModel.flush(subtransaction.category.id);
							}

							if (subtransaction.subcategory && subtransaction.subcategory.id) {
								this.categoryModel.flush(subtransaction.subcategory.id);
							}

							if (subtransaction.account && subtransaction.account.id) {
								this.accountModel.flush(subtransaction.account.id);
							}
						});

						// Resolve the promise
						q.resolve(savedTransaction);
					});
					break;

				// no default
			}

			// Resolve the promise (unless explicitly delayed)
			if (resolve) {
				q.resolve(savedTransaction);
			}

			// Return the promise
			return q.promise;
		}

		// Helper function to update the LRU caches after saving a transaction
		updateLruCaches(transaction) {
			// Create a deferred so that we return a promise
			const q = this.$q.defer();
			let resolve = true;

			// Add the primary account to the LRU cache
			this.accountModel.addRecent(transaction.primary_account);

			// Add the payee or security to the LRU cache
			if ("investment" === transaction.primary_account.account_type) {
				this.securityModel.addRecent(transaction.security);
			} else {
				this.payeeModel.addRecent(transaction.payee);
			}

			switch (transaction.transaction_type) {
				case "Basic":

					// Add the category and subcategory to the LRU cache
					this.categoryModel.addRecent(transaction.category);
					if (transaction.subcategory) {
						this.categoryModel.addRecent(transaction.subcategory);
					}
					break;

				case "Transfer":
				case "SecurityTransfer":
				case "SecurityInvestment":
				case "Dividend":

					// Add the account to the LRU cache
					this.accountModel.addRecent(transaction.account);
					break;

				case "Split":
				case "LoanRepayment":
				case "Payslip":

					// Delay resolving the promise
					resolve = false;

					this.transactionModel.findSubtransactions(transaction.id).then(subtransactions => {
						angular.forEach(subtransactions, subtransaction => {
							if ("Transfer" === subtransaction.transaction_type) {
								// Add the account to the LRU cache
								this.accountModel.addRecent(subtransaction.account);
							} else {
								// Add the category and subcategory to the LRU cache
								this.categoryModel.addRecent(subtransaction.category);
								if (subtransaction.subcategory) {
									this.categoryModel.addRecent(subtransaction.subcategory);
								}
							}
						});

						// Resolve the promise
						q.resolve(transaction);
					});
					break;

				// no default
			}

			// Resolve the promise (unless explicitly delayed)
			if (resolve) {
				q.resolve(transaction);
			}

			// Return the promise
			return q.promise;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.transactionModel.save(this.transaction)
				.then(this.invalidateCaches.bind(this))
				.then(this.updateLruCaches.bind(this))
				.then(transaction => this.$modalInstance.close(transaction))
				.catch(error => this.errorMessage = error.data);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionEditController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modalInstance", "$q", "$timeout", "filterFilter", "limitToFilter", "currencyFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "transaction"];
}
