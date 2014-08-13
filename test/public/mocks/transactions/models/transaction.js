(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactionsMocks");

	// Declare the transactionModelMock provider
	mod.provider("transactionModelMock", function() {
		var provider = this;

		// Helper function to configure stub responses
		var responses = function(stub, successArgs, errorArgs) {
			stub.withArgs(sinon.match(successArgs)).returns({
				then: function(successCallback) {
					successCallback();
				}
			});

			stub.withArgs(sinon.match(errorArgs)).returns({
				then: function(successCallback, errorCallback) {
					errorCallback({data: "unsuccessful"});
				}
			});

			return stub;
		};

		// Mock transactionModel object
		provider.transactionModel = {
			save: responses(sinon.stub(), {id: 1}, {id: -1}),
			destroy: responses(sinon.stub(), {id: 1}, {id: -1}),
			updateStatus: sinon.stub().returns({
				then: function(callback) { callback(); }
			}),
			flag: responses(sinon.stub(), {id: 1}, {id: -1}),
			unflag: responses(sinon.stub(), 1, -1)
		};

		provider.$get = function() {
			// Return the mock transactionModel object
			return provider.transactionModel;
		};
	});

	// Declare the transactionMock provider
	mod.provider("transactionMock", function() {
		var provider = this;

		// Mock transaction object
		provider.transaction = {
			id: 1,
			flag: "transaction flag"
		};

		provider.$get = function() {
			// Return the mock transaction object
			return provider.transaction;
		};
	});
})();
