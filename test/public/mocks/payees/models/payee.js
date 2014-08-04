(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payeesMocks");

	// Declare the payeeModelMock provider
	mod.provider("payeeModelMock", function() {
		var provider = this;

		// Mock payeeModel object
		provider.payeeModel = {
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Rturn the mock payeeModel object
			return provider.payeeModel;
		};
	});
})();
