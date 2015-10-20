{
	/**
	 * Implementation
	 */
	class Directive {
		constructor($sce, transactionModel, accountModel) {
			return {
				restrict: "A",
				scope: {
					transactionStatus: "=transactionStatus"
				},
				templateUrl: "transactions/views/status.html",
				link: (scope, iElement) => {
					// Set the current status & icon, calculate the next status
					function setCurrentStatus(status) {
						scope.currentStatus = status;

						switch (status) {
							case "Reconciled":
								scope.nextStatus = "Unreconciled";
								scope.icon = "lock";
								break;

							case "Cleared":
								scope.nextStatus = "Reconciled";
								scope.icon = "tag";
								break;

							default:
								scope.nextStatus = "Cleared";
								scope.icon = "tag";
								break;
						}

						scope.tooltip = $sce.trustAsHtml(`Status: <strong class="${scope.currentStatus.toLowerCase()}">${scope.currentStatus}</strong><br/>Click to mark as <strong class="${scope.nextStatus.toLowerCase()}">${scope.nextStatus}</strong>`);
					}

					// Declare a click handler to toggle the status
					scope.clickHandler = () => {
						const status = "Unreconciled" === scope.nextStatus ? null : scope.nextStatus;

						transactionModel.updateStatus(accountModel.path(scope.transactionStatus.account.id), scope.transactionStatus.transaction.id, status).then(() => setCurrentStatus(scope.nextStatus));
					};

					// Set the initial status
					setCurrentStatus(scope.transactionStatus.transaction.status || "Unreconciled");

					// Attach the event handlers
					iElement.on("click", scope.clickHandler);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", () => iElement.off("click", scope.clickHandler));
				}
			};
		}

		static factory($sce, transactionModel, accountModel) {
			return new Directive($sce, transactionModel, accountModel);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.directive("transactionStatus", Directive.factory);

	/**
	 * Dependencies
	 */
	Directive.factory.$inject = ["$sce", "transactionModel", "accountModel"];
}
