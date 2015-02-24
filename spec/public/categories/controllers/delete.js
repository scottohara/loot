(function() {
	"use strict";

	/*jshint expr: true */

	describe("CategoryDeleteController", function() {
		// The object under test
		var categoryDeleteController;

		// Dependencies
		var $modalInstance,
				categoryModel,
				category;

		// Load the modules
		beforeEach(module("lootMocks", "lootCategories", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "categoryModel", "category"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _categoryModel_, _category_) {
			$modalInstance = _$modalInstance_;
			categoryModel = _categoryModel_;
			category = _category_;
			categoryDeleteController = controllerTest("CategoryDeleteController");
		}));

		it("should make the passed category available to the view", function() {
			categoryDeleteController.category.should.deep.equal(category);
		});

		describe("deleteCategory", function() {
			it("should reset any previous error messages", function() {
				categoryDeleteController.errorMessage = "error message";
				categoryDeleteController.deleteCategory();
				(null === categoryDeleteController.errorMessage).should.be.true;
			});

			it("should delete the category", function() {
				categoryDeleteController.deleteCategory();
				categoryModel.destroy.should.have.been.calledWith(category);
			});

			it("should close the modal when the category delete is successful", function() {
				categoryDeleteController.deleteCategory();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the category delete is unsuccessful", function() {
				categoryDeleteController.category.id = -1;
				categoryDeleteController.deleteCategory();
				categoryDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				categoryDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
