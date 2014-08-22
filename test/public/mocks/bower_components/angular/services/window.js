(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $windowMock provider
	mod.provider("$windowMock", function() {
		var provider = this;
		// Mock $window object
		provider.$window = {
			localStorage: {
				getItem: sinon.stub(),
				setItem: sinon.stub()
			},
			sessionStorage: {
				getItem: sinon.stub(),
				removeItem: sinon.stub(),
				setItem: sinon.stub()
			},
			btoa: sinon.stub().returns("base64 encoded")
		};

		// Configure stub responses
		provider.$window.localStorage.getItem.withArgs("lootClosingBalance-1").returns(1000);

		provider.$get = function() {
			// Return the mock $window object
			return provider.$window;
		};
	});
})();
