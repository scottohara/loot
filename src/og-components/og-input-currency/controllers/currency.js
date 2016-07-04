{
	/**
	 * Implementation
	 */
	class OgInputCurrencyController {
		constructor(numberFilter) {
			this.numberFilter = numberFilter;
			this.decimalPlaces = 2;
		}

		setDecimalPlaces(decimalPlaces) {
			const defaultDecimalPlaces = 2;

			this.decimalPlaces = (Boolean(decimalPlaces) && Number(decimalPlaces)) || defaultDecimalPlaces;
		}

		// Converts formatted value to raw value
		formattedToRaw(value) {
			return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
		}

		// Converts raw value to formatted value
		rawToFormatted(value) {
			const formatted = this.numberFilter((Boolean(value) && Number(value)) || 0, this.decimalPlaces);

			if (0 === formatted.indexOf("-")) {
				return `-$${formatted.substring(1)}`;
			}

			return `$${formatted}`;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgInputCurrencyController", OgInputCurrencyController);

	/**
	 * Dependencies
	 */
	OgInputCurrencyController.$inject = ["numberFilter"];
}
