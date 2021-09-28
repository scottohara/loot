import type { Category } from "categories/types";
import type CategoryModel from "categories/models/category";
import angular from "angular";

export default class CategoryEditController {
	public readonly category: Category;

	public readonly mode: "Add" | "Edit";

	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly filterFilter: angular.IFilterFilter,
						private readonly limitToFilter: angular.IFilterLimitTo,
						private readonly categoryModel: CategoryModel,
						category: Category | undefined) {
		this.category = angular.extend({}, category) as Category;
		this.mode = undefined === category ? "Add" : "Edit";
	}

	// List of parent categories for the typeahead
	public parentCategories(filter: string, limit: number): angular.IPromise<Category[]> {
		return this.categoryModel.all().then((categories: Category[]): Category[] => this.limitToFilter(this.filterFilter(categories, { name: filter }), limit));
	}

	// Save and close the modal
	public save(): void {
		// Copy the parent details
		if (undefined === this.category.parent || null === this.category.parent) {
			this.category.parent_id = null;
		} else {
			this.category.direction = this.category.parent.direction;
			this.category.parent_id = Number(this.category.parent.id);
		}

		this.errorMessage = null;
		this.categoryModel.save(this.category).then((category: angular.IHttpResponse<Category>): void => this.$uibModalInstance.close(category.data), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without saving
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

CategoryEditController.$inject = ["$uibModalInstance", "filterFilter", "limitToFilter", "categoryModel", "category"];