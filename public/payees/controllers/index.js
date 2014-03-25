(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('payees');

	// Declare the Payee Index controller
	mod.controller('payeeIndexController', ['$scope', 'payeeModel',
		function($scope, payeeModel) {
			payeeModel.all().then(function(payees) {
				$scope.payees = payees;
			});
		}
	]);
})();
