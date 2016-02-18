describe("CategoryEditController", () => {
	let	categoryEditController,
			controllerTest,
			$uibModalInstance,
			categoryModel,
			category;

	// Load the modules
	beforeEach(module("lootMocks", "lootCategories", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "categoryModel", "category"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _categoryModel_, _category_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		categoryModel = _categoryModel_;
		category = _category_;
		categoryEditController = controllerTest("CategoryEditController");
	}));

	describe("when a category is provided", () => {
		it("should make the passed category available to the view", () => categoryEditController.category.should.deep.equal(category));

		it("should set the mode to Edit", () => categoryEditController.mode.should.equal("Edit"));
	});

	describe("when a category is not provided", () => {
		beforeEach(() => categoryEditController = controllerTest("CategoryEditController", {category: null}));

		it("should make an empty category object available to the view", () => {
			categoryEditController.category.should.be.an.Object;
			categoryEditController.category.should.be.empty;
		});

		it("should set the mode to Add", () => categoryEditController.mode.should.equal("Add"));
	});

	describe("parentCategories", () => {
		it("should fetch the list of parent categories", () => {
			categoryEditController.parentCategories();
			categoryModel.all.should.have.been.called;
		});

		it("should return a filtered & limited list of parent categories", () => {
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

	describe("save", () => {
		it("should copy the parent details if the category has a parent", () => {
			categoryEditController.category.parent = {
				id: "parent id",
				direction: "parent direction"
			};
			categoryEditController.save();
			categoryEditController.category.direction.should.equal("parent direction");
			categoryEditController.category.parent_id.should.equal("parent id");
		});

		it("should clear the parent id if the category does not have a parent", () => {
			categoryEditController.save();
			(null === categoryEditController.category.parent_id).should.be.true;
		});

		it("should reset any previous error messages", () => {
			categoryEditController.errorMessage = "error message";
			categoryEditController.save();
			(null === categoryEditController.errorMessage).should.be.true;
		});

		it("should save the category", () => {
			categoryEditController.save();
			categoryModel.save.should.have.been.calledWith(sinon.match(category));
		});

		it("should close the modal when the category save is successful", () => {
			categoryEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(category);
		});

		it("should display an error message when the category save is unsuccessful", () => {
			categoryEditController.category.id = -1;
			categoryEditController.save();
			categoryEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			categoryEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
