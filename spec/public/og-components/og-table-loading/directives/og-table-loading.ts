import type DirectiveTest from "mocks/loot/directivetest";
import angular from "angular";

describe("ogTableLoading", (): void => {
	let ogTableLoading: DirectiveTest;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((directiveTest: DirectiveTest): void => {
		ogTableLoading = directiveTest;
		ogTableLoading.configure("og-table-loading", "tr");
		ogTableLoading.scope.model = false;
		ogTableLoading.compile({ "og-table-loading": "model" }, true);
	}) as Mocha.HookFunction);

	it("should be hidden", (): void => {
		ogTableLoading.scope.$digest();
		ogTableLoading["element"] = ogTableLoading["element"].find("tr");
		ogTableLoading["element"].hasClass("ng-hide").should.be.true;
	});

	describe("isLoading", (): void => {
		beforeEach((): boolean => (ogTableLoading.scope.model = true));

		it("should be visible", (): void => {
			ogTableLoading.scope.$digest();
			ogTableLoading["element"] = ogTableLoading["element"].find("tr");
			ogTableLoading["element"].hasClass("ng-hide").should.be.false;
		});

		it("should include a TD spanning the specified number of columns", (): void => {
			ogTableLoading.compile({
				"og-table-loading": "model",
				colspan: "3"
			}, true);
			ogTableLoading.scope.$digest();
			ogTableLoading["element"] = ogTableLoading["element"].find("tr");

			const td: JQuery<Element> = ogTableLoading["element"].find("td");

			td.should.not.be.empty;
			String(td.attr("colspan")).should.equal("3");
		});
	});
});
