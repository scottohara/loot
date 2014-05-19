(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security model
	mod.factory('securityModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('securities');

			// Retrieves the list of securities
			model.all = function(includeBalances) {
				return $http.get('/securities' + (includeBalances ? "?include_balances" : ""), {
					cache: includeBalances ? false : cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the most recent transaction for a security
			model.findLastTransaction = function(securityId, accountType) {
				return $http.get('/securities/' + securityId + '/transactions/last', {
					params: {
						account_type: accountType
					}
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of securities, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
