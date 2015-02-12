(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootCategoriesMocks")
		.provider("categoryModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["categoryMockProvider", "categoriesMockProvider", "$qMockProvider"];

	/**
	 * Implementation
	 */
	function Provider(categoryMockProvider, categoriesMockProvider, $qMockProvider) {
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
			path: function(id) {
				return "/categories/" + id;
			},
			recent: "recent categories list",
			all: $q.promisify({
				response: categoriesMockProvider.$get()
			}),
			allWithChildren: sinon.stub().returns(categoriesMockProvider.$get()),
			find: function(id) {
				var category;

				// Get the matching category
				if (id < 10) {
					category = categoriesMockProvider.$get()[id - 1];
				} else {
					var parentId = id / 10 - 1;
					id = id % 10;
					category = categoriesMockProvider.$get()[parentId].children[id];
				}

				// Return a promise-like object that resolves with the category
				return $q.promisify({response: category})();
			},
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find()
		sinon.spy(provider.categoryModel, "find");

		provider.$get = function() {
			// Return the mock categoryModel object
			return provider.categoryModel;
		};
	}
})();
