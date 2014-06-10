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
					backdrop: 'static',
					size: 'sm'
				}).result.then(function() {
					$state.reload();
				});
			};

			// Logout
			$scope.logout = function() {
				authenticationModel.logout();
				$state.reload();
			};

			// Search
			$scope.search = function() {
				$state.go('root.transactions', {
					query: $scope.query
				});
			};

			// Globally disable/enable any table key-bindings
			$scope.toggleNavigationGloballyDisabled = function(state) {
				$scope.navigationGloballyDisabled = state;
			};
		}
	]);
})();
