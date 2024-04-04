import "~/transactions/css/status.css";
import type {
	TransactionStatus,
	TransactionStatusScope,
} from "~/transactions/types";
import type AccountModel from "~/accounts/models/account";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type TransactionModel from "~/transactions/models/transaction";
import TransactionStatusView from "~/transactions/views/status.html";

export default class TransactionStatusDirective {
	public constructor(
		$sce: angular.ISCEService,
		transactionModel: TransactionModel,
		accountModel: AccountModel,
		ogModalErrorService: OgModalErrorService,
	) {
		const showError: (message?: string) => void =
				ogModalErrorService.showError.bind(ogModalErrorService),
			directive: angular.IDirective = {
				restrict: "A",
				scope: {
					transactionStatus: "=transactionStatus",
				},
				templateUrl: TransactionStatusView,
				link(scope: TransactionStatusScope, iElement: JQuery<Element>): void {
					// Set the current status & icon, calculate the next status
					function setCurrentStatus(status: TransactionStatus): void {
						scope.currentStatus =
							null === status || "" === status ? "Unreconciled" : status;

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

						scope.tooltip = $sce.trustAsHtml(
							`Status: <strong class="${scope.currentStatus.toLowerCase()}">${
								scope.currentStatus
							}</strong><br/>Click to mark as <strong class="${scope.nextStatus.toLowerCase()}">${
								scope.nextStatus
							}</strong>`,
						) as string;
					}

					// Declare a click handler to toggle the status
					scope.clickHandler = (): void => {
						const status: TransactionStatus =
							"Unreconciled" === scope.nextStatus ? "" : scope.nextStatus;

						transactionModel
							.updateStatus(
								accountModel.path(scope.transactionStatus.account.id),
								Number(scope.transactionStatus.transaction.id),
								status,
							)
							.then((): void => setCurrentStatus(scope.nextStatus))
							.catch(showError);
					};

					// Set the initial status
					setCurrentStatus(scope.transactionStatus.transaction.status);

					// Attach the event handlers
					iElement.on("click", scope.clickHandler);

					// When the element is destroyed, remove all event handlers
					iElement.on(
						"$destroy",
						(): JQuery<Element> => iElement.off("click", scope.clickHandler),
					);
				},
			};

		return directive;
	}

	public static factory(
		$sce: angular.ISCEService,
		transactionModel: TransactionModel,
		accountModel: AccountModel,
		ogModalErrorService: OgModalErrorService,
	): TransactionStatusDirective {
		return new TransactionStatusDirective(
			$sce,
			transactionModel,
			accountModel,
			ogModalErrorService,
		);
	}
}

TransactionStatusDirective.factory.$inject = [
	"$sce",
	"transactionModel",
	"accountModel",
	"ogModalErrorService",
];
