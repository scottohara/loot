import angular from "angular";

describe("ogTableLoading", () => {
	let ogTableLoading;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(directiveTest => {
		ogTableLoading = directiveTest;
		ogTableLoading.configure("og-table-loading", "tr");
		ogTableLoading.scope.model = false;
		ogTableLoading.compile({"og-table-loading": "model"}, true);
	}));

	it("should be hidden", () => {
		ogTableLoading.scope.$digest();
		ogTableLoading.element = ogTableLoading.element.find("tr");
		ogTableLoading.element.hasClass("ng-hide").should.be.true;
	});

	describe("isLoading", () => {
		beforeEach(() => (ogTableLoading.scope.model = true));

		it("should be visible", () => {
			ogTableLoading.scope.$digest();
			ogTableLoading.element = ogTableLoading.element.find("tr");
			ogTableLoading.element.hasClass("ng-hide").should.be.false;
		});

		it("should include a TD spanning the specified number of columns", () => {
			ogTableLoading.compile({
				"og-table-loading": "model",
				colspan: 3
			}, true);
			ogTableLoading.scope.$digest();
			ogTableLoading.element = ogTableLoading.element.find("tr");

			const td = ogTableLoading.element.find("td");

			td.should.not.be.empty;
			td.attr("colspan").should.equal("3");
		});
	});
});
