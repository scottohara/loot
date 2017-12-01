import {Category} from "categories/types";
import CategoryDeleteController from "categories/controllers/delete";
import {CategoryModelMock} from "mocks/categories/types";
import {ControllerTestFactory} from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {UibModalInstanceMock} from "mocks/node-modules/angular/types";
import angular from "angular";

describe("CategoryDeleteController", (): void => {
	let	categoryDeleteController: CategoryDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			categoryModel: CategoryModelMock,
			category: Category;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootCategories", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "categoryModel", "category"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _categoryModel_: CategoryModelMock, _category_: Category): void => {
		$uibModalInstance = _$uibModalInstance_;
		categoryModel = _categoryModel_;
		category = _category_;
		categoryDeleteController = controllerTest("CategoryDeleteController") as CategoryDeleteController;
	}));

	it("should make the passed category available to the view", (): Chai.Assertion => categoryDeleteController.category.should.deep.equal(category));

	describe("deleteCategory", (): void => {
		it("should reset any previous error messages", (): void => {
			categoryDeleteController.errorMessage = "error message";
			categoryDeleteController.deleteCategory();
			(null === categoryDeleteController.errorMessage).should.be.true;
		});

		it("should delete the category", (): void => {
			categoryDeleteController.deleteCategory();
			categoryModel.destroy.should.have.been.calledWith(category);
		});

		it("should close the modal when the category delete is successful", (): void => {
			categoryDeleteController.deleteCategory();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the category delete is unsuccessful", (): void => {
			categoryDeleteController.category.id = -1;
			categoryDeleteController.deleteCategory();
			(categoryDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			categoryDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
