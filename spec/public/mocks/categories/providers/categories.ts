import type { Category } from "categories/types";
import type { Mock } from "mocks/types";
import createCategory from "mocks/categories/factories";

export default class CategoriesMockProvider implements Mock<Category[]> {
	// Mock categories object
	public constructor(private readonly categories: Category[] = [
		createCategory({ id: 1, name: "aa", num_children: 2, children: [
			createCategory({ id: 10, name: "aa_1", parent_id: 1, parent:
				createCategory({ id: 1, name: "aa", num_children: 2 })
			}),
			createCategory({ id: 11, name: "aa_2", parent_id: 1, parent:
				createCategory({ id: 1, name: "aa", num_children: 2 })
			})
		] }),
		createCategory({ id: 2, name: "bb", direction: "outflow", num_children: 2, children: [
			createCategory({ id: 20, name: "bb_1", direction: "outflow", parent_id: 2, parent:
				createCategory({ id: 2, name: "bb", direction: "outflow", num_children: 2 })
			}),
			createCategory({ id: 21, name: "bb_2", direction: "outflow", parent_id: 2, parent:
				createCategory({ id: 2, name: "bb", direction: "outflow", num_children: 2 })
			})
		] }),
		createCategory({ id: 3, name: "cc", num_transactions: 2, num_children: 2, children: [
			createCategory({ id: 30, name: "cc_1", parent_id: 3, parent:
				createCategory({ id: 3, name: "cc", num_transactions: 2 })
			}),
			createCategory({ id: 31, name: "cc_2", parent_id: 3, parent:
				createCategory({ id: 3, name: "cc", num_transactions: 2 })
			})
		] }),
		createCategory({ id: 4, name: "ba", direction: "outflow", children: [] }),
		createCategory({ id: 5, name: "ab", children: [] }),
		createCategory({ id: 6, name: "bc", direction: "outflow", children: [] }),
		createCategory({ id: 7, name: "ca", children: [] }),
		createCategory({ id: 8, name: "cb", direction: "outflow", children: [] }),
		createCategory({ id: 9, name: "ac" })
	]) {}

	public $get(): Category[] {
		// Return the mock categories object
		return this.categories;
	}
}

CategoriesMockProvider.$inject = [];