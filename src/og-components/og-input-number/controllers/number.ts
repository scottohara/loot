export default class OgInputNumberController {
	// Converts formatted value to raw value
	public formattedToRaw(value: string): number {
		return Number(value.replace(/[^0-9\-.]/gu, "")) || 0;
	}

	// Converts raw value to formatted value
	public rawToFormatted(value: number): string {
		return String(value);
	}
}

OgInputNumberController.$inject = [];