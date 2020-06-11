import EstimateFilter from "schedules/filters/estimate";
import angular from "angular";

describe("estimate", (): void => {
	let estimateFilter: EstimateFilter;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules"));

	// Inject the object under test
	beforeEach(angular.mock.inject((_estimateFilter_: EstimateFilter): EstimateFilter => (estimateFilter = _estimateFilter_)));

	it("should prefix an estimate with ~", (): Chai.Assertion => (estimateFilter as (value: string, isEstimate: boolean) => string)("1", true).should.equal("~1"));

	it("should not prefix a non-estimate", (): Chai.Assertion => (estimateFilter as (value: string, isEstimate: boolean) => string)("1", false).should.equal("1"));
});
