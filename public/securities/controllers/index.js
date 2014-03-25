(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security Index controller
	mod.controller('securityIndexController', ['$scope', 'securityModel',
		function($scope, securityModel) {
			securityModel.all().then(function(securities) {
				$scope.securities = securities;
			});
		}
	]);
})();
