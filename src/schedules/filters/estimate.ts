export default class EstimateFilter {
	public constructor() {
		return (value: string, isEstimate: boolean): string => `${isEstimate ? "~" : ""}${value}`;
	}

	public static factory(): EstimateFilter {
		return new EstimateFilter();
	}
}

EstimateFilter.factory.$inject = [];