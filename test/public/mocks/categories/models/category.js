(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("categoriesMocks");

	// Declare the categoryMock provider
	mod.provider("categoryMock", function() {
		var provider = this;

		// Mock category object
		provider.category = {id: 1};

		provider.$get = function() {
			// Return the mock category object
			return provider.category;
		};
	});

	// Declare the categoriesMock provider
	mod.provider("categoriesMock", function() {
		var provider = this;

		// Mock categories object
		provider.categories = [
			{id: 1, name: "aa"},
			{id: 2, name: "bb"},
			{id: 3, name: "cc"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
		];

		provider.$get = function() {
			// Return the mock categories object
			return provider.categories;
		};
	});

	// Declare the categoryModelMock provider
	mod.provider("categoryModelMock", function(categoryMockProvider, categoriesMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: categoryMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};

		// Mock categoryModel object
		provider.categoryModel = {
			recent: "recent categories list",
			all: $q.promisify({
				response: categoriesMockProvider.$get()
			}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock categoryModel object
			return provider.categoryModel;
		};
	});
})();
