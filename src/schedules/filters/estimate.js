export default class EstimateFilter {
	constructor() {
		return (value, isEstimate) => `${isEstimate ? "~" : ""}${value}`;
	}

	static factory() {
		return new EstimateFilter();
	}
}

EstimateFilter.factory.$inject = [];