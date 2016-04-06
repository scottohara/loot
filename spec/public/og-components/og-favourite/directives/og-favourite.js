describe("ogFavourite", () => {
	let ogFavourite;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Load the template
	beforeEach(module("og-components/og-favourite/views/favourite.html"));

	// Configure & compile the object under test
	beforeEach(inject(directiveTest => {
		ogFavourite = directiveTest;
		ogFavourite.configure("og-favourite", "i");
		ogFavourite.scope.model = {
			context: false,
			type: "test"
		};
		ogFavourite.compile({"og-favourite": "model"}, true);
	}));

	describe("default", () => {
		beforeEach(() => {
			ogFavourite.scope.$digest();
			ogFavourite.element = ogFavourite.element.find("i");
		});

		it("should not be active", () => ogFavourite.element.hasClass("active").should.not.be.true);

		it("should show the type in a tooltip", () => ogFavourite.element.attr("uib-tooltip").should.equal("Favourite test"));
	});

	describe("favourite", () => {
		beforeEach(() => ogFavourite.scope.model.context = true);

		it("should be active", () => {
			ogFavourite.scope.$digest();
			ogFavourite.element = ogFavourite.element.find("i");
			ogFavourite.element.hasClass("active").should.be.true;
		});
	});
});
