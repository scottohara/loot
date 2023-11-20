import type DirectiveTest from "~/mocks/loot/directivetest";
import type { DirectiveTestModel } from "~/mocks/types";
import angular from "angular";

describe("ogFavourite", (): void => {
	let ogFavourite: DirectiveTest;

	// Load the modules
	beforeEach(
		angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject((directiveTest: DirectiveTest): void => {
			ogFavourite = directiveTest;
			ogFavourite.configure("og-favourite", "i");
			ogFavourite.scope.model = {
				context: false,
				type: "test",
			};
			ogFavourite.compile({ "og-favourite": "model" }, true);
		}) as Mocha.HookFunction,
	);

	describe("default", (): void => {
		beforeEach((): void => {
			ogFavourite.scope.$digest();
			ogFavourite["element"] = ogFavourite["element"].find("i");
		});

		it("should not be active", (): Chai.Assertion =>
			expect(ogFavourite["element"].hasClass("active")).to.not.be.true);

		it("should show the type in a tooltip", (): Chai.Assertion =>
			expect(String(ogFavourite["element"].attr("uib-tooltip"))).to.equal(
				"Favourite test",
			));
	});

	describe("favourite", (): void => {
		beforeEach(
			(): boolean =>
				((ogFavourite.scope.model as DirectiveTestModel).context = true),
		);

		it("should be active", (): void => {
			ogFavourite.scope.$digest();
			ogFavourite["element"] = ogFavourite["element"].find("i");
			expect(ogFavourite["element"].hasClass("active")).to.be.true;
		});
	});
});
