(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction model
	mod.factory('transactionModel', ['$http', 'payeeModel', 'categoryModel', 'securityModel',
		function($http, payeeModel, categoryModel, securityModel) {
			var model = {};

			// Returns the API path
			model.path = function (id) {
				return '/transactions' + (id ? '/' + id : '');
			};
 
			// Returns the full API path including parent context
			model.fullPath = function (context, id) {
				return context + model.path(id);
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
					return response.data;
				});
			};

			// Retrieves subtransactions for a given split transaction
			model.findSubtransactions = function(context, id) {
				return $http.get(model.fullPath(context, id) + '/subtransactions').then(function(response) {
					return response.data;
				});
			};

			// Retrieves a single transaction
			model.find = function(context, id) {
				return $http.get(model.fullPath(context, id)).then(function(response) {
					return response.data;
				});
			};

			// Saves a transaction
			model.save = function(context, transaction) {
				// If the payee, category, subcategory or security are new; flush the $http cache
				if (typeof transaction.payee === 'string') {
					payeeModel.flush();
				}

				if (typeof transaction.category === 'string' || typeof transaction.subcategory === 'string') {
					categoryModel.flush();
				}

				if (typeof transaction.security === 'string') {
					securityModel.flush();
				}

				return $http({
					method: transaction.id ? 'PATCH' : 'POST',
					url: model.fullPath(context, transaction.id),
					data: transaction
				});
			};

			// Deletes a transaction
			model.destroy = function(context, transaction) {
				return $http.delete(fullPath(context, transaction.id));
			};

			// Updates the status of a transaction
			model.updateStatus = function(context, id, status) {
				return $http({
					method: status ? 'PATCH' : 'DELETE',
					url: model.fullPath(context, id) + '/status' + (status ? '?' + status : '')
				});
			};

			// Flags a transaction
			model.flag = function(context, transaction) {
				return $http.put(model.fullPath(context, transaction.id) + '/flag', {
					memo: transaction.flag
				});
			};

			// Unflags a transaction
			model.unflag = function(context, id) {
				return $http.delete(model.fullPath(context, id) + '/flag');
			};

			return model;
		}
	]);
})();
