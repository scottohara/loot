(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.factory("transactionModel", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$http", "accountModel", "payeeModel", "categoryModel", "securityModel"];

	/**
	 * Implementation
	 */
	function Factory($http, accountModel, payeeModel, categoryModel, securityModel) {
		var model = {};

		// Returns the API path
		model.path = function(id) {
			return "/transactions" + (id ? "/" + id : "");
		};

		// Returns the full API path including parent context
		model.fullPath = function(context, id) {
			return context + model.path(id);
		};

		// Performs post-processing after parsing from JSON
		model.parse = function(transaction) {
			// Convert the transaction date from a string ("YYYY-MM-DD") to a native JS date
			transaction.transaction_date = moment(transaction.transaction_date).startOf("day").toDate();
			return transaction;
		};

		// Performs pre-processing before stringifying from JSON
		model.stringify = function(transaction) {
			// To avoid timezone issue, convert the native JS date back to a string ("YYYY-MM-DD") before saving
			var transactionCopy = angular.copy(transaction);
			transactionCopy.transaction_date = moment(transactionCopy.transaction_date).format("YYYY-MM-DD");
			return transactionCopy;
		};

		// Retrieves a batch of transactions
		model.all = function(context, fromDate, direction, unreconciledOnly) {
			return $http.get(model.fullPath(context), {
				params: {
					as_at: fromDate,
					direction: direction,
					unreconciled: unreconciledOnly
				}
			}).then(function(response) {
				response.data.transactions = response.data.transactions.map(model.parse);
				return response.data;
			});
		};

		// Searches for a batch of transactions
		model.query = function(query, fromDate, direction) {
			return $http.get(model.path(), {
				params: {
					query: query,
					as_at: fromDate,
					direction: direction
				}
			}).then(function(response) {
				response.data.transactions = response.data.transactions.map(model.parse);
				return response.data;
			});
		};

		// Retrieves subtransactions for a given split transaction
		model.findSubtransactions = function(id) {
			return $http.get(model.path(id) + "/subtransactions").then(function(response) {
				return response.data;
			});
		};

		// Retrieves a single transaction
		model.find = function(id) {
			return $http.get(model.path(id)).then(function(response) {
				return model.parse(response.data);
			});
		};

		// Saves a transaction
		model.save = function(transaction) {
			// Invalidate the payee, category, subcategory and/or security $http caches
			model.invalidateCaches(transaction);

			return $http({
				method: transaction.id ? "PATCH" : "POST",
				url: model.path(transaction.id),
				data: model.stringify(transaction)
			}).then(function(response) {
				return model.parse(response.data);
			});
		};

		// Deletes a transaction
		model.destroy = function(transaction) {
			// Invalidate the payee, category, subcategory and/or security $http caches
			model.invalidateCaches(transaction);

			return $http.delete(model.path(transaction.id));
		};

		// Helper function to handle all $http cache invalidations
		model.invalidateCaches = function(transaction) {
			model.invalidateCache(accountModel, transaction.primary_account);
			model.invalidateCache(payeeModel, transaction.payee);
			model.invalidateCache(categoryModel, transaction.category);
			model.invalidateCache(categoryModel, transaction.subcategory);
			model.invalidateCache(accountModel, transaction.account);
			model.invalidateCache(securityModel, transaction.security);

			// Subtransactions
			angular.forEach(transaction.subtransactions, function(subtransaction) {
				model.invalidateCache(categoryModel, subtransaction.category);
				model.invalidateCache(categoryModel, subtransaction.subcategory);
				model.invalidateCache(accountModel, subtransaction.account);
			});
		};

		// Helper function to handle a single $http cache invalidation
		model.invalidateCache = function(itemModel, item) {
			if (typeof item === "string" && "" !== item) {
				// Item is new; flush the corresponding $http cache
				itemModel.flush();
			} else if (item && item.id) {
				// Item is existing; remove single item from the corresponding $http cache
				itemModel.flush(item.id);
			}
		};

		// Updates the status of a transaction
		model.updateStatus = function(context, id, status) {
			return $http({
				method: status ? "PATCH" : "DELETE",
				url: model.fullPath(context, id) + "/status" + (status ? "?" + status : "")
			});
		};

		// Flags a transaction
		model.flag = function(transaction) {
			return $http.put(model.path(transaction.id) + "/flag", {
				memo: transaction.flag
			});
		};

		// Unflags a transaction
		model.unflag = function(id) {
			return $http.delete(model.path(id) + "/flag");
		};

		return model;
	}
})();
