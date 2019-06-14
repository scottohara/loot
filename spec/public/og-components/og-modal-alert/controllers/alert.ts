import {ControllerTestFactory} from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {OgModalAlert} from "og-components/og-modal-alert/types";
import OgModalAlertController from "og-components/og-modal-alert/controllers/alert";
import {UibModalInstanceMock} from "mocks/node-modules/angular/types";
import angular from "angular";

describe("OgModalAlertController", (): void => {
	let	ogModalAlertController: OgModalAlertController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			alert: OgModalAlert;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "alert"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _alert_: OgModalAlert): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		alert = _alert_;
		ogModalAlertController = controllerTest("OgModalAlertController") as OgModalAlertController;
	}));

	it("should make the passed alert available to the view", (): void => {
		ogModalAlertController.alert.message.should.equal(alert.message);
		(ogModalAlertController.alert.closeButtonStyle as string).should.equal("primary");
	});

	describe("closeModal", (): void => {
		it("should dismiss the modal", (): void => {
			ogModalAlertController.closeModal();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
