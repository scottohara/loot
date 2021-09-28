import type {
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import type CategoriesMockProvider from "mocks/categories/providers/categories";
import type { Category } from "categories/types";
import type CategoryMockProvider from "mocks/categories/providers/category";
import type { CategoryModelMock } from "mocks/categories/types";
import type { Mock } from "mocks/types";
import type QMockProvider from "mocks/node-modules/angular/services/q";
import type { SinonStub } from "sinon";
import sinon from "sinon";

export default class CategoryModelMockProvider implements Mock<CategoryModelMock> {
	private readonly categoryModel: CategoryModelMock;

	public constructor(categoryMockProvider: CategoryMockProvider, categoriesMockProvider: CategoriesMockProvider, $qMockProvider: QMockProvider) {
		// Success/error = options for the stub promises
		const	$q: QMock = $qMockProvider.$get(),
					success: PromiseMockConfig<{ data: Category; }> = {
						args: { id: 1 },
						response: { data: categoryMockProvider.$get() }
					},
					error: PromiseMockConfig<void> = {
						args: { id: -1 }
					};

		// Mock categoryModel object
		this.categoryModel = {
			recent: "recent categories list",
			type: "category",
			path(id: number): string {
				return `/categories/${id}`;
			},
			all: $q.promisify({
				response: categoriesMockProvider.$get()
			}),
			allWithChildren: sinon.stub().returns(categoriesMockProvider.$get()),
			find(id: number): SinonStub {
				let category: Category;

				// Get the matching category
				if (id < 10) {
					category = categoriesMockProvider.$get()[id - 1];
				} else {
					const parentId: number = (id / 10) - 1,
								childId: number = id % 10;

					category = (categoriesMockProvider.$get()[parentId].children as Category[])[childId];
				}

				// Return a promise-like object that resolves with the category
				return $q.promisify({ response: category })() as SinonStub;
			},
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			toggleFavourite(category: Category): SinonStub {
				return $q.promisify({ response: !category.favourite })() as SinonStub;
			},
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find() and toggleFavourite()
		sinon.spy(this.categoryModel, "find");
		sinon.spy(this.categoryModel, "toggleFavourite");
	}

	public $get(): CategoryModelMock {
		// Return the mock categoryModel object
		return this.categoryModel;
	}
}

CategoryModelMockProvider.$inject = ["categoryMockProvider", "categoriesMockProvider", "$qMockProvider"];