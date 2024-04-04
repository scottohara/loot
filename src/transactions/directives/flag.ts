import "~/transactions/css/flag.css";
import type { Transaction, TransactionFlagScope } from "~/transactions/types";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import TransactionEditFlagView from "~/transactions/views/edit-flag.html";
import TransactionFlagView from "~/transactions/views/flag.html";

enum FlagTypes {
	followup = "Follow Up",
	noreceipt = "No Receipt",
	taxdeductible = "Tax Deductible",
}

export default class TransactionFlagDirective {
	public constructor(
		$sce: angular.ISCEService,
		$uibModal: angular.ui.bootstrap.IModalService,
		ogTableNavigableService: OgTableNavigableService,
		ogModalErrorService: OgModalErrorService,
	) {
		const showError: (message?: string) => void =
				ogModalErrorService.showError.bind(ogModalErrorService),
			directive: angular.IDirective = {
				restrict: "A",
				scope: {
					transaction: "=transactionFlag",
				},
				templateUrl: TransactionFlagView,
				link(scope: TransactionFlagScope, iElement: JQuery<Element>): void {
					function setTooltip(): void {
						scope.tooltip = $sce.trustAsHtml(
							scope.transaction.flag_type
								? `<strong class="${scope.transaction.flag_type}">${
										FlagTypes[scope.transaction.flag_type]
									}</strong><br/>${scope.transaction.flag}`
								: "Flag transaction...",
						) as string;
					}

					// Declare a click handler to open the flag transaction dialog
					scope.clickHandler = (): void => {
						// Disable navigation on the table
						ogTableNavigableService.enabled = false;

						// Show the modal
						$uibModal
							.open({
								templateUrl: TransactionEditFlagView,
								controller: "TransactionFlagController",
								controllerAs: "vm",
								backdrop: "static",
								size: "sm",
								resolve: {
									transaction: (): Transaction => scope.transaction,
								},
							})
							.result.then((transaction: Transaction): void => {
								scope.transaction = transaction;
								setTooltip();
							})
							.finally((): true => (ogTableNavigableService.enabled = true))
							.catch(showError);
					};

					// Set the initial tooltip
					setTooltip();

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
		$uibModal: angular.ui.bootstrap.IModalService,
		ogTableNavigableService: OgTableNavigableService,
		ogModalErrorService: OgModalErrorService,
	): TransactionFlagDirective {
		return new TransactionFlagDirective(
			$sce,
			$uibModal,
			ogTableNavigableService,
			ogModalErrorService,
		);
	}
}

TransactionFlagDirective.factory.$inject = [
	"$sce",
	"$uibModal",
	"ogTableNavigableService",
	"ogModalErrorService",
];
