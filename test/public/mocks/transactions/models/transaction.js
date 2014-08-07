(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactionsMocks");

	// Declare the transactionModelMock provider
	mod.provider("transactionModelMock", function() {
		var provider = this;

		// Mock transactionModel object
		provider.transactionModel = {
			updateStatus: sinon.stub().returns({
				then: function(callback) { callback(); }
			})
		};

		provider.$get = function() {
			// Rturn the mock transactionModel object
			return provider.transactionModel;
		};
	});
})();
