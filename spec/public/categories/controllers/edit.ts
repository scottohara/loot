import { Category } from "categories/types";
import CategoryEditController from "categories/controllers/edit";
import { CategoryModelMock } from "mocks/categories/types";
import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";
import createCategory from "mocks/categories/factories";

describe("CategoryEditController", (): void => {
	let	categoryEditController: CategoryEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			categoryModel: CategoryModelMock,
			category: Category;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootCategories", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "categoryModel", "category"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _categoryModel_: CategoryModelMock, _category_: Category): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		categoryModel = _categoryModel_;
		category = _category_;
		categoryEditController = controllerTest("CategoryEditController") as CategoryEditController;
	}));

	describe("when a category is provided", (): void => {
		it("should make the passed category available to the view", (): Chai.Assertion => categoryEditController.category.should.deep.equal(category));

		it("should set the mode to Edit", (): Chai.Assertion => categoryEditController.mode.should.equal("Edit"));
	});

	describe("when a category is not provided", (): void => {
		beforeEach((): CategoryEditController => (categoryEditController = controllerTest("CategoryEditController", { category: null }) as CategoryEditController));

		it("should make an empty category object available to the view", (): void => {
			categoryEditController.category.should.be.an("object");
			categoryEditController.category.should.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion => categoryEditController.mode.should.equal("Add"));
	});

	describe("parentCategories", (): void => {
		it("should fetch the list of parent categories", (): void => {
			categoryEditController.parentCategories("", 1);
			categoryModel.all.should.have.been.called;
		});

		it("should return a filtered & limited list of parent categories", (): Chai.PromisedAssertion => categoryEditController.parentCategories("a", 3).should.eventually.deep.equal([
			createCategory({ id: 1, name: "aa", num_children: 2, children: [
				createCategory({ id: 10, name: "aa_1", parent_id: 1, parent:
					createCategory({ id: 1, name: "aa", num_children: 2 })
				}),
				createCategory({ id: 11, name: "aa_2", parent_id: 1, parent:
					createCategory({ id: 1, name: "aa", num_children: 2 })
				})
			] }),
			createCategory({ id: 4, name: "ba", direction: "outflow", children: [] }),
			createCategory({ id: 5, name: "ab", children: [] })
		]));
	});

	describe("save", (): void => {
		it("should copy the parent details if the category has a parent", (): void => {
			categoryEditController.category.parent = createCategory({
				id: 1,
				name: "parent",
				direction: "outflow"
			});
			categoryEditController.save();
			categoryEditController.category.direction.should.equal("outflow");
			(categoryEditController.category.parent_id as number).should.equal(1);
		});

		it("should clear the parent id if the category does not have a parent", (): void => {
			categoryEditController.save();
			(null === categoryEditController.category.parent_id).should.be.true;
		});

		it("should reset any previous error messages", (): void => {
			categoryEditController.errorMessage = "error message";
			categoryEditController.save();
			(null === categoryEditController.errorMessage).should.be.true;
		});

		it("should save the category", (): void => {
			categoryEditController.save();
			categoryModel.save.should.have.been.calledWith(category);
		});

		it("should close the modal when the category save is successful", (): void => {
			categoryEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(category);
		});

		it("should display an error message when the category save is unsuccessful", (): void => {
			categoryEditController.category.id = -1;
			categoryEditController.save();
			(categoryEditController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			categoryEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
