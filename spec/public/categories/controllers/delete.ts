import type { Category } from "~/categories/types";
import type CategoryDeleteController from "~/categories/controllers/delete";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("CategoryDeleteController", (): void => {
	let	categoryDeleteController: CategoryDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			categoryModel: CategoryModelMock,
			category: Category;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootCategories", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "categoryModel", "category"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _categoryModel_: CategoryModelMock, _category_: Category): void => {
		$uibModalInstance = _$uibModalInstance_;
		categoryModel = _categoryModel_;
		category = _category_;
		categoryDeleteController = controllerTest("CategoryDeleteController") as CategoryDeleteController;
	}) as Mocha.HookFunction);

	it("should make the passed category available to the view", (): Chai.Assertion => expect(categoryDeleteController.category).to.deep.equal(category));

	describe("deleteCategory", (): void => {
		it("should reset any previous error messages", (): void => {
			categoryDeleteController.errorMessage = "error message";
			categoryDeleteController.deleteCategory();
			expect(categoryDeleteController.errorMessage as string | null).to.be.null;
		});

		it("should delete the category", (): void => {
			categoryDeleteController.deleteCategory();
			expect(categoryModel.destroy).to.have.been.calledWith(category);
		});

		it("should close the modal when the category delete is successful", (): void => {
			categoryDeleteController.deleteCategory();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when the category delete is unsuccessful", (): void => {
			categoryDeleteController.category.id = -1;
			categoryDeleteController.deleteCategory();
			expect(categoryDeleteController.errorMessage as string).to.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			categoryDeleteController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
