{
	/**
	 * Implementation
	 */
	class Provider {
		constructor() {
			// Mock categories object
			this.categories = [
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
		}

		$get() {
			// Return the mock categories object
			return this.categories;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootCategoriesMocks")
		.provider("categoriesMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = [];
}
