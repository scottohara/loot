(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security Index controller
	mod.controller('securityIndexController', ['$scope', 'securityModel',
		function($scope, securityModel) {
			securityModel.allWithBalances().then(function(securities) {
				$scope.securities = securities;
				$scope.totalValue = securities.reduce(function(totalValue, security) {
					return totalValue + Number(Number(security.current_value).toFixed(2));
				}, 0);
			});
		}
	]);
})();
