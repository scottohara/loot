import {Category} from "categories/types";
import {Mock} from "mocks/types";
import createCategory from "mocks/categories/factories";

export default class CategoryMockProvider implements Mock<Category> {
	// Mock category object
	public constructor(private readonly category: Category = createCategory({
		id: 1, name: "aa", num_children: 2, children: [
			createCategory({id: 10, name: "aa_1", parent_id: 1, parent:
				createCategory({id: 1, name: "aa", num_children: 2})
			}),
			createCategory({id: 11, name: "aa_2", parent_id: 1, parent:
				createCategory({id: 1, name: "aa", num_children: 2})
			})
		]
	})) {}

	public $get(): Category {
		// Return the mock category object
		return this.category;
	}
}

CategoryMockProvider.$inject = [];