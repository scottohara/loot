import type { ControllerTestFactory } from "~/mocks/types";
import type OgInputNumberController from "~/og-components/og-input-number/controllers/number";
import angular from "angular";

describe("OgInputNumberController", (): void => {
	let ogInputNumberController: OgInputNumberController;

	// Load the modules
	beforeEach(
		angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(controllerTest: ControllerTestFactory): OgInputNumberController =>
				(ogInputNumberController = controllerTest(
					"OgInputNumberController",
				) as OgInputNumberController),
		) as Mocha.HookFunction,
	);

	it("should default to 4 decimal places", (): Chai.Assertion =>
		expect(ogInputNumberController.decimalPlaces).to.equal(4));

	describe("decimalPlaces", (): void => {
		it("should set the specified number of decimals", (): void => {
			ogInputNumberController.decimalPlaces = 3;
			expect(ogInputNumberController.decimalPlaces).to.equal(3);
		});
	});

	describe("formattedToRaw", (): void => {
		it("should return 0 if the value is blank", (): Chai.Assertion =>
			expect(ogInputNumberController.formattedToRaw("")).to.equal(0));

		it("should return 0 if the value contains no numerics", (): Chai.Assertion =>
			expect(ogInputNumberController.formattedToRaw("-abcd.e")).to.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", (): Chai.Assertion =>
			expect(ogInputNumberController.formattedToRaw("-1a2b3c4d.e5f")).to.equal(
				-1234.5,
			));
	});

	describe("rawToFormatted", (): void => {
		it("should return 0.0000 if the value is undefined", (): Chai.Assertion =>
			expect(ogInputNumberController.rawToFormatted(Number(""))).to.equal(
				"0.0000",
			));

		it("should return 0.0000 if the value is null", (): Chai.Assertion =>
			expect(ogInputNumberController.rawToFormatted(Number(null))).to.equal(
				"0.0000",
			));

		it("should return 0.0000 if the value is NaN", (): Chai.Assertion =>
			expect(ogInputNumberController.rawToFormatted(Number("abc"))).to.equal(
				"0.0000",
			));

		it("should return the passed value unchanged", (): Chai.Assertion =>
			expect(ogInputNumberController.rawToFormatted(1)).to.equal("1.0000"));

		it("should display the value formatted to a specified number of decimals if the model is a valid number", (): void => {
			ogInputNumberController.decimalPlaces = 3;
			expect(ogInputNumberController.rawToFormatted(100000)).to.equal(
				"100,000.000",
			);
		});
	});
});
