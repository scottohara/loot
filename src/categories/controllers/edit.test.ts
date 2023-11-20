import type { Category } from "~/categories/types";
import type CategoryEditController from "~/categories/controllers/edit";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";
import createCategory from "~/mocks/categories/factories";

describe("CategoryEditController", (): void => {
	let categoryEditController: CategoryEditController,
		controllerTest: ControllerTestFactory,
		$uibModalInstance: UibModalInstanceMock,
		categoryModel: CategoryModelMock,
		category: Category;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootCategories",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"categoryModel",
					"category",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_categoryModel_: CategoryModelMock,
				_category_: Category,
			): void => {
				controllerTest = _controllerTest_;
				$uibModalInstance = _$uibModalInstance_;
				categoryModel = _categoryModel_;
				category = _category_;
				categoryEditController = controllerTest(
					"CategoryEditController",
				) as CategoryEditController;
			},
		) as Mocha.HookFunction,
	);

	describe("when a category is provided", (): void => {
		it("should make the passed category available to the view", (): Chai.Assertion =>
			expect(categoryEditController.category).to.deep.equal(category));

		it("should set the mode to Edit", (): Chai.Assertion =>
			expect(categoryEditController.mode).to.equal("Edit"));
	});

	describe("when a category is not provided", (): void => {
		beforeEach(
			(): CategoryEditController =>
				(categoryEditController = controllerTest("CategoryEditController", {
					category: undefined,
				}) as CategoryEditController),
		);

		it("should make an empty category object available to the view", (): void => {
			expect(categoryEditController.category).to.be.an("object");
			expect(categoryEditController.category).to.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion =>
			expect(categoryEditController.mode).to.equal("Add"));
	});

	describe("parentCategories", (): void => {
		it("should fetch the list of parent categories", (): void => {
			categoryEditController.parentCategories("", 1);
			expect(categoryModel.all).to.have.been.called;
		});

		it("should return a filtered & limited list of parent categories", async (): Promise<Chai.Assertion> =>
			expect(
				await categoryEditController.parentCategories("a", 3),
			).to.deep.equal([
				createCategory({
					id: 1,
					name: "aa",
					num_children: 2,
					children: [
						createCategory({
							id: 10,
							name: "aa_1",
							parent_id: 1,
							parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
						}),
						createCategory({
							id: 11,
							name: "aa_2",
							parent_id: 1,
							parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
						}),
					],
				}),
				createCategory({
					id: 4,
					name: "ba",
					direction: "outflow",
					children: [],
				}),
				createCategory({ id: 5, name: "ab", children: [] }),
			]));
	});

	describe("save", (): void => {
		it("should copy the parent details if the category has a parent", (): void => {
			categoryEditController.category.parent = createCategory({
				id: 1,
				name: "parent",
				direction: "outflow",
			});
			categoryEditController.save();
			expect(categoryEditController.category.direction).to.equal("outflow");
			expect(categoryEditController.category.parent_id as number).to.equal(1);
		});

		it("should clear the parent id if the category does not have a parent", (): void => {
			categoryEditController.save();
			expect(categoryEditController.category.parent_id).to.be.null;
		});

		it("should reset any previous error messages", (): void => {
			categoryEditController.errorMessage = "error message";
			categoryEditController.save();
			expect(categoryEditController.errorMessage as string | null).to.be.null;
		});

		it("should save the category", (): void => {
			categoryEditController.save();
			expect(categoryModel.save).to.have.been.calledWith(category);
		});

		it("should close the modal when the category save is successful", (): void => {
			categoryEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(category);
		});

		it("should display an error message when the category save is unsuccessful", (): void => {
			categoryEditController.category.id = -1;
			categoryEditController.save();
			expect(categoryEditController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			categoryEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
