const DEFAULT_DECIMAL_PLACES = 4;

export default class OgInputNumberController {
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
		const rawValue = Number(value.replace(/[^0-9\-.]/gu, ""));

		return isNaN(rawValue) ? 0 : rawValue;
	}

	// Converts raw value to formatted value
	public rawToFormatted(value: number): string {
		return this.numberFilter(isNaN(value) ? 0 : Number(value), this.decimalPlaces);
	}
}

OgInputNumberController.$inject = ["numberFilter"];