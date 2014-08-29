(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactionsMocks");

	// Declare the contextMock provider
	mod.provider("contextMock", function(payeeMockProvider) {
		var provider = this;

		provider.$get = function() {
			// Return the mock payee object
			return payeeMockProvider.$get();
		};
	});

	// Declare the contextModelMock provider
	mod.provider("contextModelMock", function(payeeModelMockProvider) {
		var provider = this;
		
		provider.$get = function() {
			// Return the mock payeeModel object
			return payeeModelMockProvider.$get();
		};
	});
})();
