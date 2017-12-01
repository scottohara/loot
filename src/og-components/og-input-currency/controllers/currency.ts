const DEFAULT_DECIMAL_PLACES = 2;

export default class OgInputCurrencyController {
	private decimals: number = DEFAULT_DECIMAL_PLACES;

	public constructor(private readonly numberFilter: angular.IFilterNumber) {}

	public get decimalPlaces(): number {
		return this.decimals;
	}

	public set decimalPlaces(decimalPlaces: number) {
		this.decimals = (Boolean(decimalPlaces) && Number(decimalPlaces)) || DEFAULT_DECIMAL_PLACES;
	}

	// Converts formatted value to raw value
	public formattedToRaw(value: string): number {
		return Number(value.replace(/[^0-9\-.]/g, "")) || 0;
	}

	// Converts raw value to formatted value
	public rawToFormatted(value: number): string {
		const formatted: string = this.numberFilter((Boolean(value) && Number(value)) || 0, this.decimalPlaces);

		if (0 === formatted.indexOf("-")) {
			return `-$${formatted.substring(1)}`;
		}

		return `$${formatted}`;
	}
}

OgInputCurrencyController.$inject = ["numberFilter"];