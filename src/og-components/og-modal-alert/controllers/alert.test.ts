import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type OgModalAlertController from "~/og-components/og-modal-alert/controllers/alert";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("OgModalAlertController", (): void => {
	let ogModalAlertController: OgModalAlertController,
		controllerTest: ControllerTestFactory,
		$uibModalInstance: UibModalInstanceMock,
		alert: OgModalAlert;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"ogComponents",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load(["$uibModalInstance", "alert"]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_alert_: OgModalAlert,
			): void => {
				controllerTest = _controllerTest_;
				$uibModalInstance = _$uibModalInstance_;
				alert = _alert_;
				ogModalAlertController = controllerTest(
					"OgModalAlertController",
				) as OgModalAlertController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed alert available to the view", (): void => {
		expect(ogModalAlertController.alert.message).to.equal(alert.message);
		expect(ogModalAlertController.alert.closeButtonStyle as string).to.equal(
			"primary",
		);
	});

	describe("closeModal", (): void => {
		it("should dismiss the modal", (): void => {
			ogModalAlertController.closeModal();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
