import { Category } from "categories/types";
import CategoryModel from "categories/models/category";

export default class CategoryDeleteController {
	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
						private readonly categoryModel: CategoryModel,
						public readonly category: Category) {}

	// Delete and close the modal
	public deleteCategory(): void {
		this.errorMessage = null;
		this.categoryModel.destroy(this.category).then((): void => this.$uibModalInstance.close(), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

CategoryDeleteController.$inject = ["$uibModalInstance", "categoryModel", "category"];