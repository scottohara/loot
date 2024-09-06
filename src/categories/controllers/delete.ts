import type { Category } from "~/categories/types";
import type CategoryModel from "~/categories/models/category";

export default class CategoryDeleteController {
	public errorMessage: string | null = null;

	public constructor(
		private readonly $uibModalInstance: angular.ui.bootstrap.IModalInstanceService,
		private readonly categoryModel: CategoryModel,
		public readonly category: Category,
	) {}

	// Delete and close the modal
	public deleteCategory(): void {
		this.errorMessage = null;
		this.categoryModel.destroy(this.category).then(
			(): void => this.$uibModalInstance.close(),
			(error: unknown): string =>
				(this.errorMessage = (error as angular.IHttpResponse<string>).data),
		);
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

CategoryDeleteController.$inject = [
	"$uibModalInstance",
	"categoryModel",
	"category",
];
