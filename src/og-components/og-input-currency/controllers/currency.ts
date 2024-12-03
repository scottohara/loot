const DEFAULT_DECIMAL_PLACES = 2;

export default class OgInputCurrencyController {
	private decimals: number = DEFAULT_DECIMAL_PLACES;

	public constructor(private readonly numberFilter: angular.IFilterNumber) {}

	public get decimalPlaces(): number {
		return this.decimals;
	}

	public set decimalPlaces(decimalPlaces: number) {
		this.decimals = decimalPlaces;
	}

	// Converts formatted value to raw value
	public formattedToRaw(value: string): number {
		const rawValue = Number(value.replace(/[^0-9\-.]/gv, ""));

		return isNaN(rawValue) ? 0 : rawValue;
	}

	// Converts raw value to formatted value
	public rawToFormatted(value: number): string {
		const formatted: string = this.numberFilter(
			isNaN(value) ? 0 : Number(value),
			this.decimalPlaces,
		);

		if (!formatted.indexOf("-")) {
			return `-$${formatted.substring(1)}`;
		}

		return `$${formatted}`;
	}
}

OgInputCurrencyController.$inject = ["numberFilter"];
