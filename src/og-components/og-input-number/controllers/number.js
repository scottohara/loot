export default class OgInputNumberController {
	// Converts formatted value to raw value
	formattedToRaw(value) {
		return Number(value.replace(/[^0-9\-.]/g, "")) || 0;
	}

	// Converts raw value to formatted value
	rawToFormatted(value) {
		return value;
	}
}

OgInputNumberController.$inject = [];