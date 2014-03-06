(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the ogTableLoading directive
	mod.directive('ogTableLoading', [
		function() {
			return {
				restrict: 'A',
				replace: true,
				scope: {
					isLoading: '=ogTableLoading',
					colspan: '='
				},
				templateUrl: 'og-components/og-table-loading/views/loading.html'
			};
		}
	]);
})();
