import {ControllerTestFactory} from "mocks/types";
import OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import angular from "angular";

describe("OgInputCurrencyController", (): void => {
	let	ogInputCurrencyController: OgInputCurrencyController;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory): OgInputCurrencyController => (ogInputCurrencyController = controllerTest("OgInputCurrencyController") as OgInputCurrencyController)));

	it("should default to 2 decimal places", (): Chai.Assertion => ogInputCurrencyController.decimalPlaces.should.equal(2));

	describe("decimalPlaces", (): void => {
		it("should default to 2 decimals if the value is null", (): void => {
			ogInputCurrencyController.decimalPlaces = Number(null);
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		it("should default to 2 decimals if the value is NaN", (): void => {
			ogInputCurrencyController.decimalPlaces = Number("abc");
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		it("should set the specified number of decimals if valid", (): void => {
			ogInputCurrencyController.decimalPlaces = 3;
			ogInputCurrencyController.decimalPlaces.should.equal(3);
		});
	});

	describe("formattedToRaw", (): void => {
		it("should return 0 if the value is blank", (): Chai.Assertion => ogInputCurrencyController.formattedToRaw("").should.equal(0));

		it("should return 0 if the value contains no numerics", (): Chai.Assertion => ogInputCurrencyController.formattedToRaw("-abcd.e").should.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", (): Chai.Assertion => ogInputCurrencyController.formattedToRaw("$-1a2b3c4d.e5f6").should.equal(-1234.56));
	});

	describe("rawToFormatted", (): void => {
		it("should return $0.00 if the value is undefined", (): Chai.Assertion => ogInputCurrencyController.rawToFormatted(Number("")).should.equal("$0.00"));

		it("should return $0.00 if the value is null", (): Chai.Assertion => ogInputCurrencyController.rawToFormatted(Number(null)).should.equal("$0.00"));

		it("should return $0.00 if the value is NaN", (): Chai.Assertion => ogInputCurrencyController.rawToFormatted(Number("abc")).should.equal("$0.00"));

		it("should display the value formatted to 2 decimals if the model is a valid number", (): Chai.Assertion => ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.00"));

		it("should properly position the $ symbol for negative values", (): Chai.Assertion => ogInputCurrencyController.rawToFormatted(-100000).should.equal("-$100,000.00"));

		it("should display the value formatted to a specified number of decimals if the model is a valid number", (): void => {
			ogInputCurrencyController.decimalPlaces = 3;
			ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.000");
		});
	});
});
