export default class CategoryMockProvider {
	constructor() {
		// Mock category object
		this.category = {id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
			{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
			{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
		]};
	}

	$get() {
		// Return the mock category object
		return this.category;
	}
}

CategoryMockProvider.$inject = [];