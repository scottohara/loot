import { ControllerTestFactory } from "mocks/types";
import OgInputNumberController from "og-components/og-input-number/controllers/number";
import angular from "angular";

describe("OgInputNumberController", (): void => {
	let	ogInputNumberController: OgInputNumberController;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory): OgInputNumberController => (ogInputNumberController = controllerTest("OgInputNumberController") as OgInputNumberController)));

	describe("formattedToRaw", (): void => {
		it("should return 0 if the value is blank", (): Chai.Assertion => ogInputNumberController.formattedToRaw("").should.equal(0));

		it("should return 0 if the value contains no numerics", (): Chai.Assertion => ogInputNumberController.formattedToRaw("-abcd.e").should.equal(0));

		it("should strip any non-numerics (except periods & dashes) and return the remaining number", (): Chai.Assertion => ogInputNumberController.formattedToRaw("-1a2b3c4d.e5f").should.equal(-1234.5));
	});

	describe("rawToFormatted", (): void => {
		it("should return the passed value unchanged", (): Chai.Assertion => ogInputNumberController.rawToFormatted(1).should.equal("1"));
	});
});
