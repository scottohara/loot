(function() {
	"use strict";

	/*jshint expr: true */

	describe("CategoryIndexController", function() {
		// The object under test
		var categoryIndexController;

		// Dependencies
		var controllerTest,
				$timeout,
				$modal,
				$state,
				categoryModel,
				ogTableNavigableService,
				categories;

		// Load the modules
		beforeEach(module("lootMocks", "lootCategories", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "$state", "categoryModel", "categories"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$timeout_, _$modal_, _$state_, _categoryModel_, _ogTableNavigableService_, _categories_) {
			controllerTest = _controllerTest_;
			$timeout = _$timeout_;
			$modal = _$modal_;
			$state = _$state_;
			categoryModel = _categoryModel_;
			ogTableNavigableService = _ogTableNavigableService_;
			categories = _categories_;
			categoryIndexController = controllerTest("CategoryIndexController");
		}));

		it("should flatten the passed categories & subcategories and make them available to the view", function() {
			var firstParent = angular.copy(categories[0]),
					firstChild = firstParent.children[0];

			delete firstParent.children;
			categoryIndexController.categories[0].should.deep.equal(firstParent);
			categoryIndexController.categories[1].should.deep.equal(firstChild);
			categoryIndexController.categories.length.should.equal(15);
		});
			
		describe("editCategory", function() {
			var category;

			// Helper function to resort the categories array by id
			var byId = function(a, b) {
				return a.id < b.id ? -1 : 1;
			};

			beforeEach(function() {
				sinon.stub(categoryIndexController, "focusCategory");
				category = angular.copy(categoryIndexController.categories[1]);
			});

			it("should disable navigation on the table", function() {
				categoryIndexController.editCategory();
				ogTableNavigableService.enabled.should.be.false;
			});

			describe("(edit existing)", function() {
				beforeEach(function() {
					categoryIndexController.editCategory(1);
				});

				it("should open the edit category modal with a category", function() {
					$modal.open.should.have.been.called;
					categoryModel.addRecent.should.have.been.calledWith(category);
					$modal.resolves.category.should.deep.equal(category);
				});

				it("should not change the parent's children count if the parent category has not changed", function() {
					$modal.close(category);
					categoryIndexController.categories[0].num_children.should.equal(2);
				});

				it("should decrement the original parent's children count when the parent category changes", function() {
					category.parent_id = 2;
					$modal.close(category);
					categoryIndexController.categories[0].num_children.should.equal(1);
				});

				it("should not attempt to decrement original parent's children count if there was no original parent", function() {
					categoryIndexController.categories[1].parent_id = undefined;
					var originalCategories = angular.copy(categoryIndexController.categories);
					originalCategories[1].parent_id = 2;
					originalCategories[3].num_children = 3;
					category.parent_id = 2;
					$modal.close(category);
					originalCategories.sort(byId);
					categoryIndexController.categories.sort(byId);
					categoryIndexController.categories.should.deep.equal(originalCategories);
				});

				it("should not attempt to decrement original parent's children count if the parent could not be found", function() {
					categoryIndexController.categories[1].parent_id = 999;
					var originalCategories = angular.copy(categoryIndexController.categories);
					originalCategories[1].parent_id = 2;
					originalCategories[3].num_children = 3;
					category.parent_id = 2;
					$modal.close(category);
					originalCategories.sort(byId);
					categoryIndexController.categories.sort(byId);
					categoryIndexController.categories.should.deep.equal(originalCategories);
				});

				it("should increment the new parent's children count when the parent category changes", function() {
					category.parent_id = 3;
					category.parent.name = "cc";
					$modal.close(category);
					categoryIndexController.categories[5].num_children.should.equal(3);
				});
				
				it("should not attempt to increment new parent's children count if there is no new parent", function() {
					var originalCategories = angular.copy(categoryIndexController.categories);
					originalCategories[1].parent_id = undefined;
					originalCategories[0].num_children = 1;
					category.parent_id = undefined;
					$modal.close(category);
					originalCategories.sort(byId);
					categoryIndexController.categories.sort(byId);
					categoryIndexController.categories.should.deep.equal(originalCategories);
				});

				it("should not attempt to increment new parent's children count if the parent could not be found", function() {
					var originalCategories = angular.copy(categoryIndexController.categories);
					originalCategories[1].parent_id = 999;
					originalCategories[0].num_children = 1;
					category.parent_id = 999;
					$modal.close(category);
					originalCategories.sort(byId);
					categoryIndexController.categories.sort(byId);
					categoryIndexController.categories.should.deep.equal(originalCategories);
				});

				it("should update the category in the list of categories when the modal is closed", function() {
					category.name = "edited category";
					$modal.close(category);
					categoryIndexController.categories.should.include(category);
				});
			});

			describe("(add new)", function() {
				beforeEach(function() {
					category = {id: 999, name: "new category", direction: "outflow"};
					categoryIndexController.editCategory();
				});

				it("should open the edit category modal without a category", function() {
					$modal.open.should.have.been.called;
					categoryModel.addRecent.should.not.have.been.called;
					(undefined === $modal.resolves.category).should.be.true;
				});

				it("should add the new category to the list of categories when the modal is closed", function() {
					$modal.close(category);
					categoryIndexController.categories.pop().should.deep.equal(category);
				});

				it("should add the new category to the recent list", function() {
					$modal.close(category);
					categoryModel.addRecent.should.have.been.calledWith(category);
				});

				it("should increment the parent's children count for a subcategory", function() {
					category.parent_id = 1;
					$modal.close(category);
					categoryIndexController.categories[0].num_children.should.equal(3);
				});

				it("should not attempt to increment parent's children count if the parent could not be found", function() {
					var originalCategories = angular.copy(categoryIndexController.categories);
					category.parent_id = 998;
					$modal.close(category);
					originalCategories.sort(byId);
					categoryIndexController.categories.sort(byId);
					categoryIndexController.categories.pop();
					categoryIndexController.categories.should.deep.equal(originalCategories);
				});
			});

			it("should resort the categories list when the modal is closed", function() {
				var outflowCategoryWithHighestName = angular.copy(categoryIndexController.categories[13]);
				categoryIndexController.editCategory();
				$modal.close(category);
				categoryIndexController.categories.pop().should.deep.equal(outflowCategoryWithHighestName);
			});

			it("should focus the category when the modal is closed", function() {
				categoryIndexController.editCategory();
				$modal.close(category);
				categoryIndexController.focusCategory.should.have.been.calledWith(category.id);
			});

			it("should not change the categories list when the modal is dismissed", function() {
				var originalCategories = angular.copy(categoryIndexController.categories);
				categoryIndexController.editCategory();
				$modal.dismiss();
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should enable navigation on the table when the modal is closed", function() {
				categoryIndexController.editCategory();
				$modal.close(category);
				ogTableNavigableService.enabled.should.be.true;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				categoryIndexController.editCategory();
				$modal.dismiss();
				ogTableNavigableService.enabled.should.be.true;
			});
		});

		describe("deleteCategory", function() {
			var category;

			beforeEach(function() {
				category = angular.copy(categoryIndexController.categories[3]);
			});

			it("should fetch the category", function() {
				categoryIndexController.deleteCategory(3);
				categoryModel.find.should.have.been.calledWith(category.id);
			});

			it("should disable navigation on the table", function() {
				categoryIndexController.deleteCategory(3);
				ogTableNavigableService.enabled.should.be.false;
			});

			it("should show an alert if the category has transactions", function() {
				categoryIndexController.deleteCategory(6);
				$modal.open.should.have.been.called;
				$modal.resolves.alert.header.should.equal("Category has existing transactions");
			});

			it("should show the delete category modal if the category has no transactions", function() {
				categoryIndexController.deleteCategory(3);
				$modal.open.should.have.been.called;
				$modal.resolves.category.should.deep.equal(category);
			});

			it("should decrement the parent's children count for a subcategory", function() {
				categoryIndexController.deleteCategory(1);
				$modal.close(category);
				categoryIndexController.categories[0].num_children.should.equal(1);
			});

			it("should not attempt to decrement parent's children count if the parent could not be found", function() {
				categoryIndexController.categories[9].parent_id = 999;
				var originalCategories = angular.copy(categoryIndexController.categories);
				originalCategories.splice(9, 1);
				categoryIndexController.deleteCategory(9);
				$modal.close(category);
				categoryIndexController.categories.should.deep.equal(originalCategories);
			});

			it("should remove a parent category and it's children from the categories list when the modal is closed", function() {
				var child1 = categoryIndexController.categories[4],
						child2 = categoryIndexController.categories[5];

				categoryIndexController.deleteCategory(3);
				$modal.close(category);
				categoryIndexController.categories.should.not.include(category);
				categoryIndexController.categories.should.not.include(child1);
				categoryIndexController.categories.should.not.include(child2);
			});

			it("should remove a subcategory from the categories list when the modal is closed", function() {
				category = categoryIndexController.categories[1];
				categoryIndexController.deleteCategory(1);
				$modal.close(category);
				categoryIndexController.categories.should.not.include(category);
			});

			it("should transition to the categories list when the modal is closed", function() {
				categoryIndexController.deleteCategory(3);
				$modal.close(category);
				$state.go.should.have.been.calledWith("root.categories");
			});

			it("should enable navigation on the table when the modal is closed", function() {
				categoryIndexController.deleteCategory(3);
				$modal.close(category);
				ogTableNavigableService.enabled.should.be.true;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				categoryIndexController.deleteCategory(3);
				$modal.dismiss();
				ogTableNavigableService.enabled.should.be.true;
			});
		});

		describe("tableActions.selectAction", function() {
			it("should transition to the category transactions list", function() {
				categoryIndexController.tableActions.selectAction();
				$state.go.should.have.been.calledWith(".transactions");
			});
		});

		describe("tableActions.editAction", function() {
			it("should edit the category", function() {
				categoryIndexController.tableActions.editAction.should.equal(categoryIndexController.editCategory);
			});
		});

		describe("tableActions.insertAction", function() {
			it("should insert a category", function() {
				sinon.stub(categoryIndexController, "editCategory");
				categoryIndexController.tableActions.insertAction();
				categoryIndexController.editCategory.should.have.been.calledWith(undefined);
			});
		});

		describe("tableActions.deleteAction", function() {
			it("should delete a category", function() {
				categoryIndexController.tableActions.deleteAction.should.equal(categoryIndexController.deleteCategory);
			});
		});

		describe("tableActions.focusAction", function() {
			it("should focus a category when no category is currently focussed", function() {
				categoryIndexController.tableActions.focusAction(3);
				$state.go.should.have.been.calledWith(".category", {id: 2});
			});

			it("should focus a category when another category is currently focussed", function() {
				$state.currentState("**.category");
				categoryIndexController.tableActions.focusAction(3);
				$state.go.should.have.been.calledWith("^.category", {id: 2});
			});
		});

		describe("focusCategory", function() {
			beforeEach(function() {
				categoryIndexController.tableActions.focusRow = sinon.stub();
			});

			it("should do nothing when the specific category row could not be found", function() {
				(undefined === categoryIndexController.focusCategory(999)).should.be.true;
				categoryIndexController.tableActions.focusRow.should.not.have.been.called;
			});

			it("should focus the category row for the specified category", function() {
				var targetIndex = categoryIndexController.focusCategory(1);
				$timeout.flush();
				categoryIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
			});

			it("should return the index of the specified category", function() {
				var targetIndex = categoryIndexController.focusCategory(1);
				targetIndex.should.equal(0);
			});
		});

		describe("stateChangeSuccessHandler", function() {
			var toState,
					toParams,
					fromState,
					fromParams;

			beforeEach(function() {
				toState = {name: "state"};
				toParams = {id: 1};
				fromState = angular.copy(toState);
				fromParams = angular.copy(toParams);
				sinon.stub(categoryIndexController, "focusCategory");
			});

			it("should do nothing when an id state parameter is not specified", function() {
				delete toParams.id;
				categoryIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				categoryIndexController.focusCategory.should.not.have.been.called;
			});

			it("should do nothing when state parameters have not changed", function() {
				categoryIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				categoryIndexController.focusCategory.should.not.have.been.called;
			});

			it("should ensure the category is focussed when the state name changes", function() {
				toState.name = "new state";
				categoryIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				categoryIndexController.focusCategory.should.have.been.calledWith(toParams.id);
			});

			it("should ensure the category is focussed when the category id state param changes", function() {
				toParams.id = 2;
				categoryIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				categoryIndexController.focusCategory.should.have.been.calledWith(toParams.id);
			});
		});

		it("should attach a state change success handler", function() {
			sinon.stub(categoryIndexController, "stateChangeSuccessHandler");
			categoryIndexController.$scope.$emit("$stateChangeSuccess");
			categoryIndexController.stateChangeSuccessHandler.should.have.been.called;
		});
	});
})();
