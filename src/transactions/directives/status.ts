import "../css/status.less";
import {
	TransactionStatus,
	TransactionStatusScope
} from "transactions/types";
import AccountModel from "accounts/models/account";
import TransactionModel from "transactions/models/transaction";
import TransactionStatusView from "transactions/views/status.html";

export default class TransactionStatusDirective {
	public constructor($sce: angular.ISCEService, transactionModel: TransactionModel, accountModel: AccountModel) {
		const directive: angular.IDirective = {
			restrict: "A",
			scope: {
				transactionStatus: "=transactionStatus"
			},
			templateUrl: TransactionStatusView,
			link(scope: TransactionStatusScope, iElement: JQuery<Element>): void {
				// Set the current status & icon, calculate the next status
				function setCurrentStatus(status: TransactionStatus): void {
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
				scope.clickHandler = (): void => {
					const status: TransactionStatus = "Unreconciled" === scope.nextStatus ? "" : scope.nextStatus;

					transactionModel.updateStatus(accountModel.path(scope.transactionStatus.account.id), Number(scope.transactionStatus.transaction.id), status).then((): void => setCurrentStatus(scope.nextStatus));
				};

				// Set the initial status
				setCurrentStatus(scope.transactionStatus.transaction.status || "Unreconciled");

				// Attach the event handlers
				iElement.on("click", scope.clickHandler);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): JQuery<Element> => iElement.off("click", scope.clickHandler));
			}
		};

		return directive;
	}

	public static factory($sce: angular.ISCEService, transactionModel: TransactionModel, accountModel: AccountModel): TransactionStatusDirective {
		return new TransactionStatusDirective($sce, transactionModel, accountModel);
	}
}

TransactionStatusDirective.factory.$inject = ["$sce", "transactionModel", "accountModel"];