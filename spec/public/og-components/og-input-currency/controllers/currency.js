describe("OgInputCurrencyController", () => {
	let	ogInputCurrencyController;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(_controllerTest_ => {
		const controllerTest = _controllerTest_;

		ogInputCurrencyController = controllerTest("OgInputCurrencyController");
	}));

	it("should default to 2 decimal places", () => ogInputCurrencyController.decimalPlaces.should.equal(2));

	describe("setDecimalPlaces", () => {
		it("should default to 2 decimals if the value is undefined", () => {
			ogInputCurrencyController.setDecimalPlaces();
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		it("should default to 2 decimals if the value is null", () => {
			ogInputCurrencyController.setDecimalPlaces(null);
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		it("should default to 2 decimals if the value is NaN", () => {
			ogInputCurrencyController.setDecimalPlaces("abc");
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		it("should set the specified number of decimals if valid", () => {
			ogInputCurrencyController.setDecimalPlaces(3);
			ogInputCurrencyController.decimalPlaces.should.equal(3);
		});
	});

	describe("formattedToRaw", () => {
		it("should return 0 if the value is blank", () => ogInputCurrencyController.formattedToRaw("").should.equal(0));

		it("should return 0 if the value contains no numerics", () => ogInputCurrencyController.formattedToRaw("-abcd.e").should.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", () => ogInputCurrencyController.formattedToRaw("$-1a2b3c4d.e5f6").should.equal(-1234.56));
	});

	describe("rawToFormatted", () => {
		it("should return $0.00 if the value is undefined", () => ogInputCurrencyController.rawToFormatted().should.equal("$0.00"));

		it("should return $0.00 if the value is null", () => ogInputCurrencyController.rawToFormatted(null).should.equal("$0.00"));

		it("should return $0.00 if the value is NaN", () => ogInputCurrencyController.rawToFormatted("abc").should.equal("$0.00"));

		it("should display the value formatted to 2 decimals if the model is a valid number", () => ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.00"));

		it("should properly position the $ symbol for negative values", () => ogInputCurrencyController.rawToFormatted(-100000).should.equal("-$100,000.00"));

		it("should display the value formatted to a specified number of decimals if the model is a valid number", () => {
			ogInputCurrencyController.decimalPlaces = 3;
			ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.000");
		});
	});
});
