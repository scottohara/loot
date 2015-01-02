(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("categoriesMocks");

	// Declare the categoryMock provider
	mod.provider("categoryMock", function() {
		var provider = this;

		// Mock category object
		provider.category = {id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
			{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
			{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
		]};

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
			{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
				{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
				{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
			]},
			{id: 2, name: "bb", direction: "outflow", num_children: 2, children: [
				{id: 20, name: "bb_1", direction: "outflow", num_children: 0, parent_id: 2, parent: {name: "bb"}},
				{id: 21, name: "bb_2", direction: "outflow", num_children: 0, parent_id: 2, parent: {name: "bb"}}
			]},
			{id: 3, name: "cc", direction: "inflow", num_transactions: 2, num_children: 2, children: [
				{id: 30, name: "cc_1", direction: "inflow", num_children: 0, parent_id: 3, parent: {name: "cc"}},
				{id: 31, name: "cc_2", direction: "inflow", num_children: 0, parent_id: 3, parent: {name: "cc"}}
			]},
			{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
			{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []},
			{id: 6, name: "bc", direction: "outflow", num_children: 0, children: []},
			{id: 7, name: "ca", direction: "inflow", num_children: 0, children: []},
			{id: 8, name: "cb", direction: "outflow", num_children: 0, children: []},
			{id: 9, name: "ac", direction: "inflow", num_children: 0, children: []}
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
	});
})();
