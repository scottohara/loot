(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgInputCurrencyController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["numberFilter"];

	/**
	 * Implementation
	 */
	function Controller(numberFilter) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.decimalPlaces = 2;		// Default to 2 decimal places if not specified
		vm.setDecimalPlaces = setDecimalPlaces;
		vm.formattedToRaw = formattedToRaw;
		vm.rawToFormatted = rawToFormatted;

		/**
		 * Implementation
		 */
		function setDecimalPlaces(decimalPlaces) {
			vm.decimalPlaces = !!(decimalPlaces) && Number(decimalPlaces) || 2;
		}

		// Converts formatted value to raw value
		function formattedToRaw(value) {
			return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
		}

		// Converts raw value to formatted value
		function rawToFormatted(value) {
			value = numberFilter(!!(value) && Number(value) || 0, vm.decimalPlaces);
			if (value.indexOf("-") === 0) {
				return "-$" + value.substring(1);
			} else {
				return "$" + value;
			}
		}
	}
})();
