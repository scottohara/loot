(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('loot');

	// Declare the Layout controller
	mod.controller('layoutController', ['$scope', '$state', '$modal', 'authenticationModel',
		function($scope, $state, $modal, authenticationModel) {
			// Make the authenication status available on the scope
			$scope.isAuthenticated = authenticationModel.isAuthenticated;

			// Login
			$scope.login = function() {
				$modal.open({
					templateUrl: 'authentication/views/edit.html',
					controller: 'authenticationEditController',
					backdrop: 'static'
				}).result.then(function() {
					$state.reload();
				});
			};

			// Logout
			$scope.logout = function() {
				authenticationModel.logout();
				$state.reload();
			};
		}
	]);
})();
