(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootCategoriesMocks")
		.provider("categoryMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
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
	}
})();
