(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgInputNumberController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = [];

	/**
	 * Implementation
	 */
	function Controller() {
		var vm = this;

		/**
		 * Interface
		 */
		vm.formattedToRaw = formattedToRaw;
		vm.rawToFormatted = rawToFormatted;

		/**
		 * Implementation
		 */

		// Converts formatted value to raw value
		function formattedToRaw(value) {
			return Number(value.replace(/[^0-9\-\.]/g, "")) || 0;
		}

		// Converts raw value to formatted value
		function rawToFormatted(value) {
			return value;
		}
	}
})();
