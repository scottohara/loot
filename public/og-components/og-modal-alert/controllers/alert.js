(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgModalAlertController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "alert"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, alert) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.alert = angular.extend({closeButtonStyle: "primary"}, alert);
		vm.close = closeModal;

		/**
		 * Implementation
		 */

		// Close the modal
		function closeModal() {
			$modalInstance.dismiss();
		}
	}
})();
