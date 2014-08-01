(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $cacheFactoryMock provider
	mod.provider("$cacheFactoryMock", function() {
		var provider = this;
		// Mock $cache object
		provider.$cache = {
			put: sinon.stub(),
			get: sinon.stub(),
			info: sinon.stub(),
			remove: sinon.stub(),
			removeAll: sinon.stub(),
			destroy: sinon.stub()
		};

		provider.$get = function() {
			// Factory function
			return function() {
				// Return the mock $cache object
				return provider.$cache;
			};
		};
	});
})();
