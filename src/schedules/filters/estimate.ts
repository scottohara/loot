export default class EstimateFilter extends Function {
	public constructor() {
		super();

		return (value: string, isEstimate: boolean): string => `${isEstimate ? "~" : ""}${value}`;
	}

	public static factory(): EstimateFilter {
		return new EstimateFilter();
	}
}

EstimateFilter.factory.$inject = [];