describe("OgInputNumberController", () => {
	let	ogInputNumberController;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(_controllerTest_ => {
		const controllerTest = _controllerTest_;

		ogInputNumberController = controllerTest("OgInputNumberController");
	}));

	describe("formattedToRaw", () => {
		it("should return 0 if the value is blank", () => ogInputNumberController.formattedToRaw("").should.equal(0));

		it("should return 0 if the value contains no numerics", () => ogInputNumberController.formattedToRaw("-abcd.e").should.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", () => ogInputNumberController.formattedToRaw("-1a2b3c4d.e5f").should.equal(-1234.5));
	});

	describe("rawToFormatted", () => {
		it("should return the passed value unchanged", () => {
			const value = "test value";

			ogInputNumberController.rawToFormatted(value).should.equal(value);
		});
	});
});
