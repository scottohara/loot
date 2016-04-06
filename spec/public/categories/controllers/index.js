describe("CategoryIndexController", () => {
	let	categoryIndexController,
			$timeout,
			$uibModal,
			$state,
			categoryModel,
			ogTableNavigableService,
			categories;

	// Load the modules
	beforeEach(module("lootMocks", "lootCategories", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "$state", "categoryModel", "categories"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$timeout_, _$uibModal_, _$state_, _categoryModel_, _ogTableNavigableService_, _categories_) => {
		const controllerTest = _controllerTest_;

		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		categoryModel = _categoryModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		categories = _categories_;
		categoryIndexController = controllerTest("CategoryIndexController");
	}));

	it("should flatten the passed categories & subcategories and make them available to the view", () => {
		const firstParent = angular.copy(categories[0]),
					firstChild = firstParent.children[0];

		Reflect.deleteProperty(firstParent, "children");
		categoryIndexController.categories[0].should.deep.equal(firstParent);
		categoryIndexController.categories[1].should.deep.equal(firstChild);
		categoryIndexController.categories.length.should.equal(15);
	});

	describe("editCategory", () => {
		let category;

		// Helper function to resort the categories array by id
		function byId(a, b) {
			return a.id < b.id ? -1 : 1;
		}

		beforeEach(() => {
			sinon.stub(categoryIndexController, "focusCategory");
			category = angular.copy(categoryIndexController.categories[1]);
		});

		it("should disable navigation on the table", () => {
			categoryIndexController.editCategory();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", () => {
			beforeEach(() => categoryIndexController.editCategory(1));

			it("should open the edit category modal with a category", () => {
				$uibModal.open.should.have.been.called;
				categoryModel.addRecent.should.have.been.calledWith(category);
				$uibModal.resolves.category.should.deep.equal(category);
			});

			it("should not change the parent's children count if the parent category has not changed", () => {
				$uibModal.close(category);
				categoryIndexController.categories[0].num_children.should.equal(2);
			});

			it("should decrement the original parent's children count when the parent category changes", () => {
				category.parent_id = 2;
				$uibModal.close(category);
				categoryIndexController.categories[0].num_children.should.equal(1);
			});

			it("should not attempt to decrement original parent's children count if there was no original parent", () => {
				Reflect.deleteProperty(categoryIndexController.categories[1], "parent_id");
				const originalCategories = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 2;
				originalCategories[3].num_children = 3;
				category.parent_id = 2;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should not attempt to decrement original parent's children count if the parent could not be found", () => {
				categoryIndexController.categories[1].parent_id = 999;
				const originalCategories = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 2;
				originalCategories[3].num_children = 3;
				category.parent_id = 2;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should increment the new parent's children count when the parent category changes", () => {
				category.parent_id = 3;
				category.parent.name = "cc";
				$uibModal.close(category);
				categoryIndexController.categories[5].num_children.should.equal(3);
			});

			it("should not attempt to increment new parent's children count if there is no new parent", () => {
				const originalCategories = angular.copy(categoryIndexController.categories);

				Reflect.deleteProperty(originalCategories[1], "parent_id");
				originalCategories[0].num_children = 1;
				Reflect.deleteProperty(category, "parent_id");
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should not attempt to increment new parent's children count if the parent could not be found", () => {
				const originalCategories = angular.copy(categoryIndexController.categories);

				originalCategories[1].parent_id = 999;
				originalCategories[0].num_children = 1;
				category.parent_id = 999;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should update the category in the list of categories when the modal is closed", () => {
				category.name = "edited category";
				$uibModal.close(category);
				categoryIndexController.categories.should.include(category);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				category = {id: 999, name: "new category", direction: "outflow"};
				categoryIndexController.editCategory();
			});

			it("should open the edit category modal without a category", () => {
				$uibModal.open.should.have.been.called;
				categoryModel.addRecent.should.not.have.been.called;
				(!$uibModal.resolves.category).should.be.true;
			});

			it("should add the new category to the list of categories when the modal is closed", () => {
				$uibModal.close(category);
				categoryIndexController.categories.pop().should.deep.equal(category);
			});

			it("should add the new category to the recent list", () => {
				$uibModal.close(category);
				categoryModel.addRecent.should.have.been.calledWith(category);
			});

			it("should increment the parent's children count for a subcategory", () => {
				category.parent_id = 1;
				$uibModal.close(category);
				categoryIndexController.categories[0].num_children.should.equal(3);
			});

			it("should not attempt to increment parent's children count if the parent could not be found", () => {
				const originalCategories = angular.copy(categoryIndexController.categories);

				category.parent_id = 998;
				$uibModal.close(category);
				originalCategories.sort(byId);
				categoryIndexController.categories.sort(byId);
				categoryIndexController.categories.pop();
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});
		});

		it("should resort the categories list when the modal is closed", () => {
			const outflowCategoryWithHighestName = angular.copy(categoryIndexController.categories[13]);

			categoryIndexController.editCategory();
			$uibModal.close(category);
			categoryIndexController.categories.pop().should.deep.equal(outflowCategoryWithHighestName);
		});

		it("should focus the category when the modal is closed", () => {
			categoryIndexController.editCategory();
			$uibModal.close(category);
			categoryIndexController.focusCategory.should.have.been.calledWith(category.id);
		});

		it("should not change the categories list when the modal is dismissed", () => {
			const originalCategories = angular.copy(categoryIndexController.categories);

			categoryIndexController.editCategory();
			$uibModal.dismiss();
			categoryIndexController.categories.should.deep.equal(originalCategories);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			categoryIndexController.editCategory();
			$uibModal.close(category);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			categoryIndexController.editCategory();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deleteCategory", () => {
		let category;

		beforeEach(() => category = angular.copy(categoryIndexController.categories[3]));

		it("should fetch the category", () => {
			categoryIndexController.deleteCategory(3);
			categoryModel.find.should.have.been.calledWith(category.id);
		});

		it("should disable navigation on the table", () => {
			categoryIndexController.deleteCategory(3);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should show an alert if the category has transactions", () => {
			categoryIndexController.deleteCategory(6);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.alert.header.should.equal("Category has existing transactions");
		});

		it("should show the delete category modal if the category has no transactions", () => {
			categoryIndexController.deleteCategory(3);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.category.should.deep.equal(category);
		});

		it("should decrement the parent's children count for a subcategory", () => {
			categoryIndexController.deleteCategory(1);
			$uibModal.close(category);
			categoryIndexController.categories[0].num_children.should.equal(1);
		});

		it("should not attempt to decrement parent's children count if the parent could not be found", () => {
			categoryIndexController.categories[9].parent_id = 999;
			const originalCategories = angular.copy(categoryIndexController.categories);

			originalCategories.splice(9, 1);
			categoryIndexController.deleteCategory(9);
			$uibModal.close(category);
			categoryIndexController.categories.should.deep.equal(originalCategories);
		});

		it("should remove a parent category and it's children from the categories list when the modal is closed", () => {
			const child1 = categoryIndexController.categories[4],
						child2 = categoryIndexController.categories[5];

			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			categoryIndexController.categories.should.not.include(category);
			categoryIndexController.categories.should.not.include(child1);
			categoryIndexController.categories.should.not.include(child2);
		});

		it("should remove a subcategory from the categories list when the modal is closed", () => {
			category = categoryIndexController.categories[1];
			categoryIndexController.deleteCategory(1);
			$uibModal.close(category);
			categoryIndexController.categories.should.not.include(category);
		});

		it("should transition to the categories list when the modal is closed", () => {
			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			$state.go.should.have.been.calledWith("root.categories");
		});

		it("should enable navigation on the table when the modal is closed", () => {
			categoryIndexController.deleteCategory(3);
			$uibModal.close(category);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			categoryIndexController.deleteCategory(3);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("toggleFavourite", () => {
		let category;

		beforeEach(() => {
			category = categoryIndexController.categories[0];
		});

		it("should favourite the category", () => {
			category.favourite = false;
			categoryIndexController.toggleFavourite(0);
			category.favourite.should.be.true;
		});

		it("should unfavourite the category", () => {
			category.favourite = true;
			categoryIndexController.toggleFavourite(0);
			category.favourite.should.be.false;
		});

		afterEach(() => categoryModel.toggleFavourite.should.have.been.called);
	});

	describe("tableActions.selectAction", () => {
		it("should transition to the category transactions list", () => {
			categoryIndexController.tableActions.selectAction();
			$state.go.should.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", () => {
		it("should edit the category", () => {
			sinon.stub(categoryIndexController, "editCategory");
			categoryIndexController.tableActions.editAction(1);
			categoryIndexController.editCategory.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", () => {
		it("should insert a category", () => {
			sinon.stub(categoryIndexController, "editCategory");
			categoryIndexController.tableActions.insertAction();
			categoryIndexController.editCategory.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", () => {
		it("should delete a category", () => {
			sinon.stub(categoryIndexController, "deleteCategory");
			categoryIndexController.tableActions.deleteAction(1);
			categoryIndexController.deleteCategory.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", () => {
		it("should focus a category when no category is currently focussed", () => {
			categoryIndexController.tableActions.focusAction(3);
			$state.go.should.have.been.calledWith(".category", {id: 2});
		});

		it("should focus a category when another category is currently focussed", () => {
			$state.currentState("**.category");
			categoryIndexController.tableActions.focusAction(3);
			$state.go.should.have.been.calledWith("^.category", {id: 2});
		});
	});

	describe("focusCategory", () => {
		beforeEach(() => categoryIndexController.tableActions.focusRow = sinon.stub());

		it("should do nothing when the specific category row could not be found", () => {
			(!categoryIndexController.focusCategory(999)).should.be.true;
			categoryIndexController.tableActions.focusRow.should.not.have.been.called;
		});

		it("should focus the category row for the specified category", () => {
			const targetIndex = categoryIndexController.focusCategory(1);

			$timeout.flush();
			categoryIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified category", () => {
			const targetIndex = categoryIndexController.focusCategory(1);

			targetIndex.should.equal(0);
		});
	});

	describe("stateChangeSuccessHandler", () => {
		let toState,
				toParams,
				fromState,
				fromParams;

		beforeEach(() => {
			toState = {name: "state"};
			toParams = {id: 1};
			fromState = angular.copy(toState);
			fromParams = angular.copy(toParams);
			sinon.stub(categoryIndexController, "focusCategory");
		});

		it("should do nothing when an id state parameter is not specified", () => {
			Reflect.deleteProperty(toParams, "id");
			categoryIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			categoryIndexController.focusCategory.should.not.have.been.called;
		});

		it("should do nothing when state parameters have not changed", () => {
			categoryIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			categoryIndexController.focusCategory.should.not.have.been.called;
		});

		it("should ensure the category is focussed when the state name changes", () => {
			toState.name = "new state";
			categoryIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			categoryIndexController.focusCategory.should.have.been.calledWith(toParams.id);
		});

		it("should ensure the category is focussed when the category id state param changes", () => {
			toParams.id = 2;
			categoryIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			categoryIndexController.focusCategory.should.have.been.calledWith(toParams.id);
		});
	});

	it("should attach a state change success handler", () => {
		sinon.stub(categoryIndexController, "stateChangeSuccessHandler");
		categoryIndexController.$scope.$emit("$stateChangeSuccess");
		categoryIndexController.stateChangeSuccessHandler.should.have.been.called;
	});
});
