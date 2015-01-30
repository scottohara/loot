(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponentsMocks");

	// Declare the ogLruCacheFactoryMock provider
	mod.provider("ogLruCacheFactoryMock", function() {
		var provider = this;
		// Mock LruCache object
		provider.ogLruCache = {
			list: sinon.stub().returns("recent list"),
			put: sinon.stub().returns("updated list"),
			remove: sinon.stub().returns("updated list"),
			dump: sinon.stub().returns({})
		};

		provider.$get = function() {
			// Factory function
			return function() {
				// Return the mock LruCache object
				return provider.ogLruCache;
			};
		};
	});
})();
