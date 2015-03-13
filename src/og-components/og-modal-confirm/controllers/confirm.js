(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.controller("OgModalConfirmController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "confirm"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, confirm) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.confirm = angular.extend({noButtonStyle: "default", yesButtonStyle: "primary"}, confirm);
		vm.yes = yes;
		vm.no = no;

		/**
		 * Implementation
		 */

		// Yes response
		function yes() {
			// Close the modal and return true
			$modalInstance.close(true);
		}

		// No response
		function no() {
			$modalInstance.dismiss();
		}
	}
})();
