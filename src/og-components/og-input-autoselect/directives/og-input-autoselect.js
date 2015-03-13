(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogInputAutoselect", Directive);

	/**
	 * Dependencies
	 */
	Directive.$inject = ["$timeout"];

	/**
	 * Implementation
	 */
	function Directive($timeout) {
		return {
			restrict: "A",
			link: function(scope, iElement) {
				var select = function() {
					$timeout(function() {
						$(iElement).select();
					}, 0);
				};

				// Select the input value on focus
				iElement.on("focus", select);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", function() {
					iElement.off("focus", select);
				});
			}
		};
	}
})();
