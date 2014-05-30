(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('payees');

	// Declare the Payee model
	mod.factory('payeeModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('payees');

			// Returns the model type
			model.type = function() {
				return "payee";
			};

			// Returns the API path
			model.path = function(id) {
				return '/payees' + (id ? '/' + id : '');
			};

			// Retrieves the list of payees
			model.all = function() {
				return $http.get(model.path(), {
					cache: cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the most recent transaction for a payee
			model.findLastTransaction = function(payeeId, accountType) {
				return $http.get(model.path(payeeId) + '/transactions/last', {
					params: {
						account_type: accountType
					}
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves a single payee
			model.find = function(id) {
				return $http.get(model.path(id), {
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			// Saves a payee
			model.save = function(payee) {
				// Flush the $http cache
				model.flush();

				return $http({
					method: payee.id ? 'PATCH' : 'POST',
					url: model.path(payee.id),
					data: payee
				});
			};

			// Deletes a payee
			model.destroy = function(payee) {
				// Flush the $http cache
				model.flush();

				return $http.delete(model.path(payee.id));
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
