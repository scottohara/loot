(function() {
	"use strict";

	/*jshint expr: true */

	describe("categoryEditController", function() {
		// The object under test
		var categoryEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				categoryModel,
				category;

		// Load the modules
		beforeEach(module("lootMocks", "categories", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "categoryModel", "category"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _categoryModel_, _category_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			categoryModel = _categoryModel_;
			category = _category_;
			categoryEditController = controllerTest("categoryEditController");
		}));

		describe("when a category is provided", function() {
			it("should make the passed category available on the $scope", function() {
				categoryEditController.category.should.deep.equal(category);
			});
			
			it("should set the mode to Edit", function() {
				categoryEditController.mode.should.equal("Edit");
			});
		});

		describe("when a category is not provided", function() {
			beforeEach(function() {
				categoryEditController = controllerTest("categoryEditController", {category: undefined});
			});

			it("should set an empty category object on the $scope", function() {
				categoryEditController.category.should.be.an.Object;
				categoryEditController.category.should.be.empty;
			});

			it("should set the mode to Add", function() {
				categoryEditController.mode.should.equal("Add");
			});
		});

		describe("parentCategories", function() {
			it("should fetch the list of parent categories", function() {
				categoryEditController.parentCategories();
				categoryModel.all.should.have.been.called;
			});

			it("should return a filtered & limited list of parent categories", function() {
				categoryEditController.parentCategories("a", 3).should.eventually.deep.equal([
					{id: 1, name: "aa", direction: "inflow", num_children: 2, children: [
						{id: 10, name: "aa_1", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}},
						{id: 11, name: "aa_2", direction: "inflow", num_children: 0, parent_id: 1, parent: {name: "aa"}}
					]},
					{id: 4, name: "ba", direction: "outflow", num_children: 0, children: []},
					{id: 5, name: "ab", direction: "inflow", num_children: 0, children: []}
				]);
			});
		});

		describe("save", function() {
			it("should copy the parent details if the category has a parent", function() {
				categoryEditController.category.parent = {
					id: "parent id",
					direction: "parent direction",
				};
				categoryEditController.save();
				categoryEditController.category.direction.should.equal("parent direction");
				categoryEditController.category.parent_id.should.equal("parent id");
			});

			it("should clear the parent id if the category does not have a parent", function() {
				categoryEditController.save();
				(null === categoryEditController.category.parent_id).should.be.true;
			});

			it("should reset any previous error messages", function() {
				categoryEditController.errorMessage = "error message";
				categoryEditController.save();
				(null === categoryEditController.errorMessage).should.be.true;
			});

			it("should save the category", function() {
				categoryEditController.save();
				categoryModel.save.should.have.been.calledWith(sinon.match(category));
			});

			it("should close the modal when the category save is successful", function() {
				categoryEditController.save();
				$modalInstance.close.should.have.been.calledWith(category);
			});

			it("should display an error message when login unsuccessful", function() {
				categoryEditController.category.id = -1;
				categoryEditController.save();
				categoryEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				categoryEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
