{
	/**
	 * Implementation
	 */
	class Provider {
		constructor(categoryMockProvider, categoriesMockProvider, $qMockProvider) {
			// success/error = options for the stub promises
			const	success = {
							args: {id: 1},
							response: {data: categoryMockProvider.$get()}
						},
						error = {
							args: {id: -1}
						},
						$q = $qMockProvider.$get();

			// Mock categoryModel object
			this.categoryModel = {
				path(id) {
					return `/categories/${id}`;
				},
				recent: "recent categories list",
				all: $q.promisify({
					response: categoriesMockProvider.$get()
				}),
				allWithChildren: sinon.stub().returns(categoriesMockProvider.$get()),
				find(id) {
					let category;

					// Get the matching category
					if (id < 10) {
						category = categoriesMockProvider.$get()[id - 1];
					} else {
						const parentId = id / 10 - 1,
									childId = id % 10;

						category = categoriesMockProvider.$get()[parentId].children[childId];
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
			sinon.spy(this.categoryModel, "find");
		}

		$get() {
			// Return the mock categoryModel object
			return this.categoryModel;
		}
	}

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
}
