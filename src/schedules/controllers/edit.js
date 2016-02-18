{
	/**
	 * Implementation
	 */
	class ScheduleEditController {
		constructor($scope, $uibModalInstance, $timeout, filterFilter, limitToFilter, currencyFilter, payeeModel, securityModel, categoryModel, accountModel, transactionModel, scheduleModel, schedule) {
			this.$uibModalInstance = $uibModalInstance;
			this.$timeout = $timeout;
			this.filterFilter = filterFilter;
			this.limitToFilter = limitToFilter;
			this.currencyFilter = currencyFilter;
			this.payeeModel = payeeModel;
			this.securityModel = securityModel;
			this.categoryModel = categoryModel;
			this.accountModel = accountModel;
			this.transactionModel = transactionModel;
			this.scheduleModel = scheduleModel;
			this.transaction = angular.extend({transaction_type: "Basic", next_due_date: moment().startOf("day").toDate()}, schedule);

			// When schedule is passed, start in "Enter Transaction" mode; otherwise start in "Add Schedule" mode
			this.mode = schedule ? "Enter Transaction" : "Add Schedule";

			// When schedule is passed, schedule & transaction are different objects; otherwise same object
			this.schedule = schedule ? angular.copy(this.transaction) : this.transaction;

			this.loadingLastTransaction = false;
			this.account_type = null;
			this.totalAllocated = null;
			this.scheduleFrequencies = {Weekly: {weeks: 1}, Fortnightly: {weeks: 2}, Monthly: {months: 1}, Bimonthly: {months: 2}, Quarterly: {months: 3}, Yearly: {years: 1}};
			this.errorMessage = null;

			if (schedule) {
				// Set the transaction id to null, so that on save a new transaction is created
				this.transaction.id = null;

				// Default the transaction date to the next due date
				this.transaction.transaction_date = this.schedule.next_due_date;
			}

			// Set the auto-flag property based on the presence/absence of a flag
			this.schedule.autoFlag = Boolean(this.schedule.flag);
			if ("(no memo)" === this.schedule.flag) {
				this.schedule.flag = null;
			}

			// Prefetch the payees list so that the cache is populated
			payeeModel.all();

			// Watch the subtransactions array and recalculate the total allocated
			$scope.$watch(() => this.transaction.subtransactions, (newValue, oldValue) => {
				if (newValue !== oldValue && this.transaction.subtransactions) {
					this.totalAllocated = this.transaction.subtransactions.reduce((total, subtransaction) => total + (Number(subtransaction.amount * (subtransaction.direction === this.transaction.direction ? 1 : -1)) || 0), 0);

					// If we're adding a new transaction, join the subtransaction memos and update the parent memo
					if (!this.transaction.id) {
						this.memoFromSubtransactions();
					}
				}
			}, true);
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
		investmentCategories(filter) {
			const categories = [
				{id: "Buy", name: "Buy"},
				{id: "Sell", name: "Sell"},
				{id: "DividendTo", name: "Dividend To"},
				{id: "AddShares", name: "Add Shares"},
				{id: "RemoveShares", name: "Remove Shares"},
				{id: "TransferTo", name: "Transfer To"},
				{id: "TransferFrom", name: "Transfer From"}
			];

			return this.filterFilter(categories, {name: filter});
		}

		// Returns true if the passed value is typeof string (and is not empty)
		isString(object) {
			return "string" === typeof object && object.length > 0;
		}

		// Handler for payee changes
		payeeSelected() {
			// If we're adding a new schedule and an existing payee is selected
			if (!this.transaction.id && this.transaction.payee && "object" === typeof this.transaction.payee && "Enter Transaction" !== this.mode) {
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
			// If we're adding a new schedule and an existing security is selected
			if (!this.transaction.id && this.transaction.security && "object" === typeof this.transaction.security && "Enter Transaction" !== this.mode) {
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
			// Strip the id, primary account, next due date, transaction date, frequency and status
			Reflect.deleteProperty(transaction, "id");
			Reflect.deleteProperty(transaction, "primary_account");
			Reflect.deleteProperty(transaction, "next_due_date");
			Reflect.deleteProperty(transaction, "transaction_date");
			Reflect.deleteProperty(transaction, "frequency");
			Reflect.deleteProperty(transaction, "status");
			Reflect.deleteProperty(transaction, "related_status");

			// Retain the schedule's flag (if any), don't overwrite with the previous transaction's flag
			transaction.flag = this.transaction.flag;

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
		// (index) is the subtransaction index, or null for the main schedule
		categorySelected(index) {
			const transaction = isNaN(index) ? this.transaction : this.transaction.subtransactions[index];
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

		// Handler for primary account changes
		primaryAccountSelected() {
			const selectedAccountType = this.transaction.primary_account && this.transaction.primary_account.account_type;

			if (this.account_type && this.account_type !== selectedAccountType) {
				this.transaction.category = null;
				this.transaction.subcategory = null;
			}
			this.account_type = selectedAccountType;

			if (this.transaction.account && this.transaction.primary_account && this.transaction.primary_account.id === this.transaction.account.id) {
				// Primary account and transfer account can't be the same, so clear the transfer account
				this.transaction.account = null;
			}
		}

		// Joins the subtransaction memos and updates the parent memo
		memoFromSubtransactions() {
			this.transaction.memo = this.transaction.subtransactions.reduce((memo, subtransaction) => `${memo}${(subtransaction.memo ? `${"" === memo ? "" : "; "}${subtransaction.memo}` : "")}`, "");
		}

		// List of primary accounts for the typeahead
		primaryAccounts(filter, limit) {
			return this.accountModel.all().then(accounts => this.limitToFilter(this.filterFilter(accounts, {name: filter}), limit));
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

				// Filter the primary account from the results (can't transfer to self)
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

		// List of frequencies for the typeahead
		frequencies(filter) {
			return this.filterFilter(Object.keys(this.scheduleFrequencies), filter);
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

		// Calculates the next due date
		calculateNextDue() {
			this.schedule.next_due_date = moment(this.schedule.next_due_date).add(this.scheduleFrequencies[this.schedule.frequency]).toDate();

			if (this.schedule.overdue_count > 0) {
				this.schedule.overdue_count--;
			}
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

		// Switches from Enter Transaction mode to Edit Schedule mode
		edit() {
			this.mode = "Edit Schedule";
			this.transaction = this.schedule;
		}

		// Enter a transaction based on the schedule, update the next due date and close the modal
		enter() {
			this.errorMessage = null;
			this.transactionModel.save(this.transaction).then(() => this.skip(), error => this.errorMessage = error.data);
		}

		// Skip the next scheduled occurrence, update the next due date and close the modal
		skip() {
			// Calculate the next due date for the schedule
			this.calculateNextDue();

			// Update the schedule
			this.save(true);
		}

		// Save and close the modal
		save(skipped) {
			this.errorMessage = null;

			// Ensure the flag is appropriately set or cleared
			if (this.schedule.autoFlag) {
				this.schedule.flag = this.schedule.flag || "(no memo)";
			} else {
				this.schedule.flag = null;
			}

			this.scheduleModel.save(this.schedule).then(schedule => this.$uibModalInstance.close({data: schedule, skipped: Boolean(skipped)}), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without saving
		cancel() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.controller("ScheduleEditController", ScheduleEditController);

	/**
	 * Dependencies
	 */
	ScheduleEditController.$inject = ["$scope", "$uibModalInstance", "$timeout", "filterFilter", "limitToFilter", "currencyFilter", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule"];
}
