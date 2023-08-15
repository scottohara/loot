import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalConfirm } from "~/og-components/og-modal-confirm/types";
import type OgModalConfirmController from "~/og-components/og-modal-confirm/controllers/confirm";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("OgModalConfirmController", (): void => {
	let	ogModalConfirmController: OgModalConfirmController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			confirm: OgModalConfirm;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "confirm"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _confirm_: OgModalConfirm): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		confirm = _confirm_;
		ogModalConfirmController = controllerTest("OgModalConfirmController") as OgModalConfirmController;
	}) as Mocha.HookFunction);

	it("should make the passed confirmation details available on the $scope", (): void => {
		ogModalConfirmController.confirm.message.should.equal(confirm.message);
		(ogModalConfirmController.confirm.noButtonStyle as string).should.equal("default");
		(ogModalConfirmController.confirm.yesButtonStyle as string).should.equal("primary");
	});

	describe("yes", (): void => {
		it("should close the modal and return true", (): void => {
			ogModalConfirmController.yes();
			$uibModalInstance.close.should.have.been.calledWith(true);
		});
	});

	describe("no", (): void => {
		it("should dismiss the modal", (): void => {
			ogModalConfirmController.no();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
