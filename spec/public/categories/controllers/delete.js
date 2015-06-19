describe("CategoryDeleteController", () => {
	let	categoryDeleteController,
			$modalInstance,
			categoryModel,
			category;

	// Load the modules
	beforeEach(module("lootMocks", "lootCategories", mockDependenciesProvider => mockDependenciesProvider.load(["$modalInstance", "categoryModel", "category"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$modalInstance_, _categoryModel_, _category_) => {
		$modalInstance = _$modalInstance_;
		categoryModel = _categoryModel_;
		category = _category_;
		categoryDeleteController = controllerTest("CategoryDeleteController");
	}));

	it("should make the passed category available to the view", () => categoryDeleteController.category.should.deep.equal(category));

	describe("deleteCategory", () => {
		it("should reset any previous error messages", () => {
			categoryDeleteController.errorMessage = "error message";
			categoryDeleteController.deleteCategory();
			(null === categoryDeleteController.errorMessage).should.be.true;
		});

		it("should delete the category", () => {
			categoryDeleteController.deleteCategory();
			categoryModel.destroy.should.have.been.calledWith(category);
		});

		it("should close the modal when the category delete is successful", () => {
			categoryDeleteController.deleteCategory();
			$modalInstance.close.should.have.been.called;
		});

		it("should display an error message when the category delete is unsuccessful", () => {
			categoryDeleteController.category.id = -1;
			categoryDeleteController.deleteCategory();
			categoryDeleteController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			categoryDeleteController.cancel();
			$modalInstance.dismiss.should.have.been.called;
		});
	});
});
