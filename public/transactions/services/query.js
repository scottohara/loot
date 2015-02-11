(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("transactions");

	// Declare the query service
	mod.service("queryService", [
		function() {
			var query;

			this.setQuery = function(query) {
				query = query;
			};

			this.clearQuery = function() {
				query = undefined;
			};

			this.getQuery = function() {
				return query;
			};
		}
	]);
})();
