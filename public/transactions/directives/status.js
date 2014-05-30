(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the transactionStatus directive
	mod.directive('transactionStatus', ['transactionModel', 'accountModel',
		function(transactionModel, accountModel) {
			return {
				restrict: 'A',
				scope: {
					transactionStatus: '=transactionStatus'
				},
				templateUrl: 'transactions/views/status.html',
				link: function(scope, iElement) {

					// Set the current status & icon, calculate the next status
					var setCurrentStatus = function(status) {
						scope.currentStatus = status;

						switch (status) {
							case "Reconciled":
								scope.nextStatus = "Unreconciled";
								scope.icon = 'lock';
								break;

							case "Cleared":
								scope.nextStatus = "Reconciled";
								scope.icon = 'tag';
								break;

							default:
								scope.nextStatus = "Cleared";
								scope.icon = 'tag';
								break;
						}
					};

					// Declare a click handler to toggle the status
					var clickHandler = function() {
						var status = "Unreconciled" === scope.nextStatus ? null : scope.nextStatus;
						transactionModel.updateStatus(accountModel.path(scope.transactionStatus.account.id), scope.transactionStatus.transaction.id, status).then(function() {
							setCurrentStatus(scope.nextStatus);
						});
					};

					// Set the initial status
					setCurrentStatus(scope.transactionStatus.transaction.status || "Unreconciled");

					// Attach the event handlers
					iElement.on('click', clickHandler);

					// When the element is destroyed, remove all event handlers
					iElement.on('$destroy', function() {
						iElement.off('click', clickHandler);
					});
				}
			};
		}
	]);
})();
