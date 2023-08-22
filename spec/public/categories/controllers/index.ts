import type {
	StateMock,
	UibModalMock,
	UibModalMockResolves
} from "~/mocks/node-modules/angular/types";
import type { Category } from "~/categories/types";
import type CategoryIndexController from "~/categories/controllers";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type { OgTableActionHandlers } from "~/og-components/og-table-navigable/types";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type { SinonStub } from "sinon";
import angular from "angular";
import createCategory from "~/mocks/categories/factories";
import sinon from "sinon";

describe("CategoryIndexController", (): void => {
	let	categoryIndexController: CategoryIndexController,
			controllerTest: ControllerTestFactory,
			$transitions: angular.ui.IStateParamsService,
			$timeout: angular.ITimeoutService,
			$uibModal: UibModalMock,
			$state: StateMock,
			categoryModel: CategoryModelMock,
			ogTableNavigableService: OgTableNavigableService,
			categories: Category[],
			deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootCategories", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "$state", "categoryModel", "categories"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$transitions_: angular.ui.IStateParamsService, _$timeout_: angular.ITimeoutService, _$uibModal_: UibModalMock, _$state_: StateMock, _categoryModel_: CategoryModelMock, _ogTableNavigableService_: OgTableNavigableService, _categories_: Category[]): void => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		categoryModel = _categoryModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		categories = _categories_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		categoryIndexController = controllerTest("CategoryIndexController") as CategoryIndexController;
	}) as Mocha.HookFunction);

	it("should flatten the passed categories & subcategories and make them available to the view", (): void => {
		const firstParent: Category = angular.copy(categories[0]),
					[firstChild]: Category[] = firstParent.children as Category[];

		delete firstParent.children;
		expect(categoryIndexController.categories[0]).to.deep.equal(firstParent);
		expect(categoryIndexController.categories[1]).to.deep.equal(firstChild);
		expect(categoryIndexController.categories.length).to.equal(15);
	});

	it("should focus the category when a category id is specified", (): void => {
		$state.params.id = "1";
		categoryIndexController = controllerTest("CategoryIndexController", { $state }) as CategoryIndexController;
		categoryIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		expect((categoryIndexController.tableActions as OgTableActionHandlers).focusRow).to.have.been.calledWith(0);
	});

	it("should not focus the category when a category id is not specified", (): void =>	$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion => expect($transitions.onSuccess).to.have.been.calledWith({ to: "root.categories.category" }, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(categoryIndexController as angular.IController).$scope.$emit("$destroy");
		expect(deregisterTransitionSuccessHook).to.have.been.called;
	});

	it("should ensure the category is focussed when the category id state param changes", (): void => {
		const toParams: { id: string; } = { id: "1" };

		sinon.stub(categoryIndexController, "focusCategory" as keyof CategoryIndexController);
		$transitions.onSuccess.firstCall.args[1]({ params: sinon.stub().withArgs("to").returns(toParams) });
		expect(categoryIndexController["focusCategory"]).to.have.been.calledWith(Number(toParams.id));
	});

	describe("editCategory", (): void => {
		let category: Category;

		// Helper function to resort the categories array by id
		function byId(a: Category, b: Category): number {
			return Number(a.id) < Number(b.id) ? -1 : 1;
		}

		beforeEach((): void => {
			sinon.stub(categoryIndexController, "focusCategory" as keyof CategoryIndexController);
			category = angular.copy(categoryIndexController.categories[1]);
		});

		it("should disable navigation on the table", (): void => {
			categoryIndexController.editCategory();
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void => categoryIndexController.editCategory(1));

			it("should open the edit category modal with a category", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(categoryModel.addRecent).to.have.been.calledWith(category);
				expect(($uibModal.resolves as UibModalMockResolves).category as Category).to.deep.equal(category);
			});

			it("should not change the parent's children count if the parent category has not changed", (): void => {
				$uibModal.close(category);
				expect(Number(categoryIndexController.categories[0].num_children)).to.equal(2);
			});

			it("should decrement the original parent's children count when the parent category changes", (): void => {
				category.parent_id = 2;
				$uibModal.close(category);
				expect(Number(categoryIndexController.categories[0].num_children)).to.equal(1);
			});

			it("should not attempt to decrement original parent's children count if there was no original parent", (): void => {
				categoryIndexController.categories[1].parent_id = null;
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 2;
				originalCategories[3].num_children = 3;
				category.parent_id = 2;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});

			it("should not attempt to decrement original parent's children count if the parent could not be found", (): void => {
				categoryIndexController.categories[1].parent_id = 999;
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 2;
				originalCategories[3].num_children = 3;
				category.parent_id = 2;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});

			it("should increment the new parent's children count when the parent category changes", (): void => {
				category.parent_id = 3;
				(category.parent as Category).name = "cc";
				$uibModal.close(category);
				expect(Number(categoryIndexController.categories[5].num_children)).to.equal(3);
			});

			it("should not attempt to increment new parent's children count if there is no new parent", (): void => {
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = null;
				originalCategories[0].num_children = 1;
				category.parent_id = null;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});

			it("should not attempt to increment new parent's children count if the parent could not be found", (): void => {
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 999;
				originalCategories[0].num_children = 1;
				category.parent_id = 999;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});

			it("should update the category in the list of categories when the modal is closed", (): void => {
				category.name = "edited category";
				$uibModal.close(category);
				expect(categoryIndexController.categories).to.include(category);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				category = createCategory({
					id: 999,
					name: "new category",
					direction: "outflow"
				});
				categoryIndexController.editCategory();
			});

			it("should open the edit category modal without a category", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(categoryModel.addRecent).to.not.have.been.called;
				expect(($uibModal.resolves as UibModalMockResolves).category).to.be.undefined;
			});

			it("should add the new category to the list of categories when the modal is closed", (): void => {
				$uibModal.close(category);
				expect(categoryIndexController.categories.pop() as Category).to.deep.equal(category);
			});

			it("should add the new category to the recent list", (): void => {
				$uibModal.close(category);
				expect(categoryModel.addRecent).to.have.been.calledWith(category);
			});

			it("should increment the parent's children count for a subcategory", (): void => {
				category.parent_id = 1;
				$uibModal.close(category);
				expect(Number(categoryIndexController.categories[0].num_children)).to.equal(3);
			});

			it("should not attempt to increment parent's children count if there is no new parent", (): void => {
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				category.parent_id = null;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.pop();
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});

			it("should not attempt to increment parent's children count if the parent could not be found", (): void => {
				const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

				category.parent_id = 998;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.pop();
				expect(categoryIndexController.categories).to.deep.equal(originalCategories);
			});
		});

		it("should resort the categories list when the modal is closed", (): void => {
			const outflowCategoryWithHighestName: Category = angular.copy(categoryIndexController.categories[13]);

			categoryIndexController.editCategory();
			$uibModal.close(category);
			expect(categoryIndexController.categories.pop() as Category).to.deep.equal(outflowCategoryWithHighestName);
		});

		it("should focus the category when the modal is closed", (): void => {
			categoryIndexController.editCategory();
			$uibModal.close(category);
			expect(categoryIndexController["focusCategory"]).to.have.been.calledWith(category.id);
		});

		it("should not change the categories list when the modal is dismissed", (): void => {
			const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

			categoryIndexController.editCategory();
			$uibModal.dismiss();
			expect(categoryIndexController.categories).to.deep.equal(originalCategories);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			categoryIndexController.editCategory();
			$uibModal.close(category);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			categoryIndexController.editCategory();
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("deleteCategory", (): void => {
		let category: Category;

		beforeEach((): Category => (category = angular.copy(categoryIndexController.categories[3])));

		it("should fetch the category", (): void => {
			categoryIndexController.deleteCategory(3);
			expect(categoryModel.find).to.have.been.calledWith(category.id);
		});

		it("should disable navigation on the table", (): void => {
			categoryIndexController.deleteCategory(3);
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		it("should show an alert if the category has transactions", (): void => {
			categoryIndexController.deleteCategory(6);
			expect($uibModal.open).to.have.been.called;
			expect((($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert).header).to.equal("Category has existing transactions");
		});

		it("should show the delete category modal if the category has no transactions", (): void => {
			categoryIndexController.deleteCategory(3);
			expect($uibModal.open).to.have.been.called;
			expect(($uibModal.resolves as UibModalMockResolves).category as Category).to.deep.equal(category);
		});

		it("should decrement the parent's children count for a subcategory", (): void => {
			categoryIndexController.deleteCategory(1);
			$uibModal.close(category);
			expect(Number(categoryIndexController.categories[0].num_children)).to.equal(1);
		});

		it("should not attempt to decrement parent's children count if there was no parent", (): void => {
			categoryIndexController.categories[9].parent_id = null;
			const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

			originalCategories.splice(9, 1);
			categoryIndexController.deleteCategory(9);
			$uibModal.close(category);
			expect(categoryIndexController.categories).to.deep.equal(originalCategories);
		});

		it("should not attempt to decrement parent's children count if the parent could not be found", (): void => {
			categoryIndexController.categories[9].parent_id = 999;
			const originalCategories: Category[] = angular.copy(categoryIndexController.categories);

			originalCategories.splice(9, 1);
			categoryIndexController.deleteCategory(9);
			$uibModal.close(category);
			expect(categoryIndexController.categories).to.deep.equal(originalCategories);
		});

		it("should remove a parent category and it's children from the categories list when the modal is closed", (): void => {
			const [, , , , child1, child2]: Category[] = categoryIndexController.categories;

			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			expect(categoryIndexController.categories).to.not.include(category);
			expect(categoryIndexController.categories).to.not.include(child1);
			expect(categoryIndexController.categories).to.not.include(child2);
		});

		it("should remove a subcategory from the categories list when the modal is closed", (): void => {
			[, category] = categoryIndexController.categories;
			categoryIndexController.deleteCategory(1);
			$uibModal.close(category);
			expect(categoryIndexController.categories).to.not.include(category);
		});

		it("should transition to the categories list when the modal is closed", (): void => {
			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			expect($state.go).to.have.been.calledWith("root.categories");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			categoryIndexController.deleteCategory(3);
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("toggleFavourite", (): void => {
		let category: Category;

		beforeEach((): Category[] => ([category] = categoryIndexController.categories));

		it("should favourite the category", (): void => {
			category.favourite = false;
			categoryIndexController.toggleFavourite(0);
			expect(category.favourite).to.be.true;
		});

		it("should unfavourite the category", (): void => {
			category.favourite = true;
			categoryIndexController.toggleFavourite(0);
			expect(category.favourite).to.be.false;
		});

		afterEach((): Chai.Assertion => expect(categoryModel.toggleFavourite).to.have.been.called);
	});

	describe("tableActions.selectAction", (): void => {
		it("should transition to the category transactions list", (): void => {
			categoryIndexController.tableActions.selectAction();
			expect($state.go).to.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the category", (): void => {
			sinon.stub(categoryIndexController, "editCategory");
			categoryIndexController.tableActions.editAction(1);
			expect(categoryIndexController["editCategory"]).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a category", (): void => {
			sinon.stub(categoryIndexController, "editCategory");
			categoryIndexController.tableActions.insertAction();
			expect(categoryIndexController["editCategory"]).to.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a category", (): void => {
			sinon.stub(categoryIndexController, "deleteCategory");
			categoryIndexController.tableActions.deleteAction(1);
			expect(categoryIndexController["deleteCategory"]).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a category when no category is currently focussed", (): void => {
			categoryIndexController.tableActions.focusAction(3);
			expect($state.go).to.have.been.calledWith(".category", { id: 2 });
		});

		it("should focus a category when another category is currently focussed", (): void => {
			$state.currentState("**.category");
			categoryIndexController.tableActions.focusAction(3);
			expect($state.go).to.have.been.calledWith("^.category", { id: 2 });
		});
	});

	describe("focusCategory", (): void => {
		beforeEach((): SinonStub => (categoryIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific category row could not be found", (): void => {
			expect(categoryIndexController["focusCategory"](999)).to.be.NaN;
			expect((categoryIndexController.tableActions as OgTableActionHandlers).focusRow).to.not.have.been.called;
		});

		it("should focus the category row for the specified category", (): void => {
			const targetIndex: number = categoryIndexController["focusCategory"](1);

			$timeout.flush();
			expect((categoryIndexController.tableActions as OgTableActionHandlers).focusRow).to.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified category", (): void => {
			const targetIndex: number = categoryIndexController["focusCategory"](1);

			expect(targetIndex).to.equal(0);
		});
	});
});
