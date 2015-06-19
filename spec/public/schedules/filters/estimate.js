describe("estimate", () => {
	let estimateFilter;

	// Load the modules
	beforeEach(module("lootMocks", "lootSchedules"));

	// Inject the object under test
	beforeEach(inject(_estimateFilter_ => estimateFilter = _estimateFilter_));

	it("should prefix an estimate with ~", () => estimateFilter(1, true).should.equal("~1"));

	it("should not prefix a non-estimate", () => estimateFilter(1, false).should.equal("1"));
});
