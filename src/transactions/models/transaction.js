import angular from "angular";
import moment from "moment";

export default class TransactionModel {
	constructor($http, $window, accountModel, payeeModel, categoryModel, securityModel) {
		this.$http = $http;
		this.$window = $window;
		this.accountModel = accountModel;
		this.payeeModel = payeeModel;
		this.categoryModel = categoryModel;
		this.securityModel = securityModel;
		this.lastUsedTransactionDate = moment().startOf("day").toDate();
	}

	get SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY() {
		return "lootShowAllTransactionDetails";
	}

	// Returns the API path
	path(id) {
		return `/transactions${id ? `/${id}` : ""}`;
	}

	// Returns the full API path including parent context
	fullPath(context, id) {
		return `${context}${this.path(id)}`;
	}

	// Performs post-processing after parsing from JSON
	parse(transaction) {
		// Convert the transaction date from a string ("YYYY-MM-DD") to a native JS date
		transaction.transaction_date = moment(transaction.transaction_date).startOf("day").toDate();

		return transaction;
	}

	// Performs pre-processing before stringifying from JSON
	stringify(transaction) {
		// To avoid timezone issue, convert the native JS date back to a string ("YYYY-MM-DD") before saving
		const transactionCopy = angular.copy(transaction);

		transactionCopy.transaction_date = moment(transactionCopy.transaction_date).format("YYYY-MM-DD");

		return transactionCopy;
	}

	// Retrieves a batch of transactions
	all(context, fromDate, direction, unreconciledOnly) {
		return this.$http.get(this.fullPath(context), {
			params: {
				as_at: fromDate,
				direction,
				unreconciled: unreconciledOnly
			}
		}).then(response => {
			response.data.transactions = response.data.transactions.map(this.parse);

			return response.data;
		});
	}

	// Searches for a batch of transactions
	query(query, fromDate, direction) {
		return this.$http.get(this.path(), {
			params: {
				query,
				as_at: fromDate,
				direction
			}
		}).then(response => {
			response.data.transactions = response.data.transactions.map(this.parse);

			return response.data;
		});
	}

	// Retrieves subtransactions for a given split transaction
	findSubtransactions(id) {
		return this.$http.get(`${this.path(id)}/subtransactions`).then(response => response.data);
	}

	// Retrieves a single transaction
	find(id) {
		return this.$http.get(this.path(id)).then(response => this.parse(response.data));
	}

	// Saves a transaction
	save(transaction) {
		// Invalidate the payee, category, subcategory and/or security $http caches
		this.invalidateCaches(transaction);

		return this.$http({
			method: transaction.id ? "PATCH" : "POST",
			url: this.path(transaction.id),
			data: this.stringify(transaction)
		}).then(response => {
			this.lastUsedTransactionDate = transaction.transaction_date;

			return this.parse(response.data);
		});
	}

	// Deletes a transaction
	destroy(transaction) {
		// Invalidate the payee, category, subcategory and/or security $http caches
		this.invalidateCaches(transaction);

		return this.$http.delete(this.path(transaction.id));
	}

	// Helper function to handle all $http cache invalidations
	invalidateCaches(transaction) {
		this.invalidateCache(this.accountModel, transaction.primary_account);
		this.invalidateCache(this.payeeModel, transaction.payee);
		this.invalidateCache(this.categoryModel, transaction.category);
		this.invalidateCache(this.categoryModel, transaction.subcategory);
		this.invalidateCache(this.accountModel, transaction.account);
		this.invalidateCache(this.securityModel, transaction.security);

		// Subtransactions
		angular.forEach(transaction.subtransactions, subtransaction => {
			this.invalidateCache(this.categoryModel, subtransaction.category);
			this.invalidateCache(this.categoryModel, subtransaction.subcategory);
			this.invalidateCache(this.accountModel, subtransaction.account);
		});
	}

	// Helper function to handle a single $http cache invalidation
	invalidateCache(itemModel, item) {
		if ("string" === typeof item && "" !== item) {
			// Item is new; flush the corresponding $http cache
			itemModel.flush();
		} else if (item && item.id) {
			// Item is existing; remove single item from the corresponding $http cache
			itemModel.flush(item.id);
		}
	}

	// Updates the status of a transaction
	updateStatus(context, id, status) {
		return this.$http({
			method: status ? "PATCH" : "DELETE",
			url: `${this.fullPath(context, id)}/status${status ? `?${status}` : ""}`
		});
	}

	// Flags a transaction
	flag(transaction) {
		return this.$http.put(`${this.path(transaction.id)}/flag`, {
			memo: transaction.flag
		});
	}

	// Unflags a transaction
	unflag(id) {
		return this.$http.delete(`${this.path(id)}/flag`);
	}

	// Get the show all details setting from local storage
	allDetailsShown() {
		return this.$window.localStorage.getItem(this.SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY) !== "false";
	}

	// Set the show all details setting in local storage
	showAllDetails(showAllDetails) {
		this.$window.localStorage.setItem(this.SHOW_ALL_DETAILS_LOCAL_STORAGE_KEY, showAllDetails);
	}

	// Returns the last used transaction date
	get lastTransactionDate() {
		return this.lastUsedTransactionDate;
	}
}

TransactionModel.$inject = ["$http", "$window", "accountModel", "payeeModel", "categoryModel", "securityModel"];