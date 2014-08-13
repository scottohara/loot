(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payeesMocks");

	// Declare the payeeModelMock provider
	mod.provider("payeeModelMock", function() {
		var provider = this;

		// Helper function to configure stub responses
		var responses = function(stub, successArgs, errorArgs) {
			stub.withArgs(sinon.match(successArgs)).returns({
				then: function(successCallback) {
					successCallback({data: successArgs});
				}
			});

			stub.withArgs(sinon.match(errorArgs)).returns({
				then: function(successCallback, errorCallback) {
					errorCallback({data: "unsuccessful"});
				}
			});

			return stub;
		};

		// Mock payeeModel object
		provider.payeeModel = {
			recent: "recent payees list",
			all: sinon.stub().returns({
				then: function(callback) {
					return callback([
						{id: 1, name: "aa"},
						{id: 2, name: "bb"},
						{id: 3, name: "cc"},
						{id: 4, name: "ba"},
						{id: 5, name: "ab"},
						{id: 6, name: "bc"},
						{id: 7, name: "ca"},
						{id: 8, name: "cb"},
						{id: 9, name: "ac"}
					]);
				}
			}),
			save: responses(sinon.stub(), {id: 1}, {id: -1}),
			destroy: responses(sinon.stub(), {id: 1}, {id: -1}),
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock payeeModel object
			return provider.payeeModel;
		};
	});

	// Declare the payeeMock provider
	mod.provider("payeeMock", function() {
		var provider = this;

		// Mock payee object
		provider.payee = {id: 1};

		provider.$get = function() {
			// Return the mock payee object
			return provider.payee;
		};
	});
})();
