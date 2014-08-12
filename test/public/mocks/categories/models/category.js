(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("categoriesMocks");

	// Declare the categoryModelMock provider
	mod.provider("categoryModelMock", function() {
		var provider = this;

		// Mock categoryModel object
		provider.categoryModel = {
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock categoryModel object
			return provider.categoryModel;
		};
	});
})();
