(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactions");

	// Declare the query service
	mod.service("queryService", [
		function() {
			this.query = undefined;
		}
	]);
})();
