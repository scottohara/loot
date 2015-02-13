(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogViewScroll service
	mod.service("ogViewScrollService", ["$uiViewScroll",
		function($uiViewScroll) {
			this.scrollTo = function(anchor) {
				$uiViewScroll($("#" + anchor));
			};
		}
	]);
})();
