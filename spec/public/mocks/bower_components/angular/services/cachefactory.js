(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$cacheFactoryMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
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

		// Mock templates cache
		provider.templatesCache = {
			removeAll: sinon.stub()
		};

		// Mock $cacheFactory object
		provider.$cacheFactory = function() {
			// Return the mock $cache object
			return provider.$cache;
		};

		// Returns the list of caches
		provider.$cacheFactory.info = sinon.stub().returns([
			{id: "templates"},
			{id: "test"}
		]);

		// Returns a cache by it's name
		provider.$cacheFactory.get = sinon.stub();
		provider.$cacheFactory.get.withArgs("templates").returns(provider.templatesCache);
		provider.$cacheFactory.get.withArgs("test").returns(provider.$cache);

		provider.$get = function() {
			return provider.$cacheFactory;
		};
	}
})();
