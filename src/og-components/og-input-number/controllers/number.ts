export default class OgInputNumberController {
	public constructor(private readonly numberFilter: angular.IFilterNumber) {}

	// Converts formatted value to raw value
	public formattedToRaw(value: string): number {
		const rawValue = Number(value.replace(/[^0-9\-.]/gu, ""));

		return isNaN(rawValue) ? 0 : rawValue;
	}

	// Converts raw value to formatted value
	public rawToFormatted(value: number): string {
		return this.numberFilter(isNaN(value) ? 0 : Number(value));
	}
}

OgInputNumberController.$inject = ["numberFilter"];