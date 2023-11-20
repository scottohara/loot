import type { ControllerTestFactory } from "~/mocks/types";
import type OgInputCurrencyController from "~/og-components/og-input-currency/controllers/currency";
import angular from "angular";

describe("OgInputCurrencyController", (): void => {
	let ogInputCurrencyController: OgInputCurrencyController;

	// Load the modules
	beforeEach(
		angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(controllerTest: ControllerTestFactory): OgInputCurrencyController =>
				(ogInputCurrencyController = controllerTest(
					"OgInputCurrencyController",
				) as OgInputCurrencyController),
		) as Mocha.HookFunction,
	);

	it("should default to 2 decimal places", (): Chai.Assertion =>
		expect(ogInputCurrencyController.decimalPlaces).to.equal(2));

	describe("decimalPlaces", (): void => {
		it("should set the specified number of decimals", (): void => {
			ogInputCurrencyController.decimalPlaces = 3;
			expect(ogInputCurrencyController.decimalPlaces).to.equal(3);
		});
	});

	describe("formattedToRaw", (): void => {
		it("should return 0 if the value is blank", (): Chai.Assertion =>
			expect(ogInputCurrencyController.formattedToRaw("")).to.equal(0));

		it("should return 0 if the value contains no numerics", (): Chai.Assertion =>
			expect(ogInputCurrencyController.formattedToRaw("-abcd.e")).to.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", (): Chai.Assertion =>
			expect(
				ogInputCurrencyController.formattedToRaw("$-1a2b3c4d.e5f6"),
			).to.equal(-1234.56));
	});

	describe("rawToFormatted", (): void => {
		it("should return $0.00 if the value is undefined", (): Chai.Assertion =>
			expect(ogInputCurrencyController.rawToFormatted(Number(""))).to.equal(
				"$0.00",
			));

		it("should return $0.00 if the value is null", (): Chai.Assertion =>
			expect(ogInputCurrencyController.rawToFormatted(Number(null))).to.equal(
				"$0.00",
			));

		it("should return $0.00 if the value is NaN", (): Chai.Assertion =>
			expect(ogInputCurrencyController.rawToFormatted(Number("abc"))).to.equal(
				"$0.00",
			));

		it("should display the value formatted to 2 decimals if the model is a valid number", (): Chai.Assertion =>
			expect(ogInputCurrencyController.rawToFormatted(100000)).to.equal(
				"$100,000.00",
			));

		it("should properly position the $ symbol for negative values", (): Chai.Assertion =>
			expect(ogInputCurrencyController.rawToFormatted(-100000)).to.equal(
				"-$100,000.00",
			));

		it("should display the value formatted to a specified number of decimals if the model is a valid number", (): void => {
			ogInputCurrencyController.decimalPlaces = 3;
			expect(ogInputCurrencyController.rawToFormatted(100000)).to.equal(
				"$100,000.000",
			);
		});
	});
});
