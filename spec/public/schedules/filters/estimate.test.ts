import type EstimateFilter from "~/schedules/filters/estimate";
import angular from "angular";

describe("estimate", (): void => {
	let estimateFilter: EstimateFilter;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules") as Mocha.HookFunction);

	// Inject the object under test
	beforeEach(angular.mock.inject((_estimateFilter_: EstimateFilter): EstimateFilter => (estimateFilter = _estimateFilter_)) as Mocha.HookFunction);

	it("should prefix an estimate with ~", (): Chai.Assertion => expect((estimateFilter as (value: string, isEstimate: boolean) => string)("1", true)).to.equal("~1"));

	it("should not prefix a non-estimate", (): Chai.Assertion => expect((estimateFilter as (value: string, isEstimate: boolean) => string)("1", false)).to.equal("1"));
});
