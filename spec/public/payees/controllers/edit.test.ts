import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Payee } from "~/payees/types";
import type PayeeEditController from "~/payees/controllers/edit";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("PayeeEditController", (): void => {
	let	payeeEditController: PayeeEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			payeeModel: PayeeModelMock,
			payee: Payee;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootPayees", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "payee"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _payeeModel_: PayeeModelMock, _payee_: Payee): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		payeeModel = _payeeModel_;
		payee = _payee_;
		payeeEditController = controllerTest("PayeeEditController") as PayeeEditController;
	}) as Mocha.HookFunction);

	describe("when a payee is provided", (): void => {
		it("should make the passed payee available to the view", (): Chai.Assertion => expect(payeeEditController.payee).to.deep.equal(payee));

		it("should set the mode to Edit", (): Chai.Assertion => expect(payeeEditController.mode).to.equal("Edit"));
	});

	describe("when a payee is not provided", (): void => {
		beforeEach((): PayeeEditController => (payeeEditController = controllerTest("PayeeEditController", { payee: undefined }) as PayeeEditController));

		it("should make an empty payee object available to the view", (): void => {
			expect(payeeEditController.payee).to.be.an("object");
			expect(payeeEditController.payee).to.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion => expect(payeeEditController.mode).to.equal("Add"));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			payeeEditController.errorMessage = "error message";
			payeeEditController.save();
			expect(payeeEditController.errorMessage as string | null).to.be.null;
		});

		it("should save the payee", (): void => {
			payeeEditController.save();
			expect(payeeModel.save).to.have.been.calledWith(payee);
		});

		it("should close the modal when the payee save is successful", (): void => {
			payeeEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(payee);
		});

		it("should display an error message when the payee save is unsuccessful", (): void => {
			payeeEditController.payee.id = -1;
			payeeEditController.save();
			expect(payeeEditController.errorMessage as string).to.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			payeeEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
