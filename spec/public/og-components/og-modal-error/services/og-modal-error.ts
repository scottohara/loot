import type {
	UibModalMock,
	UibModalMockResolves
} from "mocks/node-modules/angular/types";
import type MockDependenciesProvider from "mocks/loot/mockdependencies";
import type { OgModalAlert } from "og-components/og-modal-alert/types";
import type OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import angular from "angular";

describe("ogModalErrorService", (): void => {
	let	ogModalErrorService: OgModalErrorService,
			$uibModal: UibModalMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal"])) as Mocha.HookFunction);

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_ogModalErrorService_: OgModalErrorService, _$uibModal_: UibModalMock): void => {
		ogModalErrorService = _ogModalErrorService_;
		$uibModal = _$uibModal_;
	}) as Mocha.HookFunction);

	describe("showError", (): void => {
		describe("when a message is provided", (): void => {
			it("should show an alert", (): void => {
				const message = "test error message";

				ogModalErrorService.showError(message);
				$uibModal.open.should.have.been.called;
				(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert).header.should.equal("An error has occurred");
				(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert).message.should.equal(message);
			});
		});

		describe("when a message is not provided", (): void => {
			it("should do nothing", (): void => {
				ogModalErrorService.showError();
				$uibModal.open.should.not.have.been.called;
			});
		});

		describe("when the message is escape key press", (): void => {
			it("should do nothing", (): void => {
				ogModalErrorService.showError("escape key press");
				$uibModal.open.should.not.have.been.called;
			});
		});

		it("should register a catch callback", (): void => {
			ogModalErrorService.showError("");
			(undefined !== $uibModal.catchCallback).should.be.true;
			(undefined === $uibModal.catchCallback?.()).should.be.true;
		});
	});
});