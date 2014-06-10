(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security model
	mod.factory('securityModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('securities');

			// Returns the model type
			model.type = function() {
				return "security";
			};

			// Returns the API path
			model.path = function(id) {
				return '/securities' + (id ? '/' + id : '');
			};

			// Retrieves the list of securities
			model.all = function(includeBalances) {
				return $http.get(model.path() + (includeBalances ? "?include_balances" : ""), {
					cache: includeBalances ? false : cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of securities, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Retrieves the most recent transaction for a security
			model.findLastTransaction = function(securityId, accountType) {
				return $http.get(model.path(securityId) + '/transactions/last', {
					params: {
						account_type: accountType
					}
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves a single security
			model.find = function(id) {
				return $http.get(model.path(id), {
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			// Saves a security
			model.save = function(security) {
				// Flush the $http cache
				model.flush();

				return $http({
					method: security.id ? 'PATCH' : 'POST',
					url: model.path(security.id),
					data: security
				});
			};

			// Deletes a security
			model.destroy = function(security) {
				// Flush the $http cache
				model.flush();

				return $http.delete(model.path(security.id));
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
