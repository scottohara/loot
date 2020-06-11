import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { Payee } from "payees/types";
import PayeeEditController from "payees/controllers/edit";
import { PayeeModelMock } from "mocks/payees/types";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("PayeeEditController", (): void => {
	let	payeeEditController: PayeeEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			payeeModel: PayeeModelMock,
			payee: Payee;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootPayees", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "payee"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _payeeModel_: PayeeModelMock, _payee_: Payee): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		payeeModel = _payeeModel_;
		payee = _payee_;
		payeeEditController = controllerTest("PayeeEditController") as PayeeEditController;
	}));

	describe("when a payee is provided", (): void => {
		it("should make the passed payee available to the view", (): Chai.Assertion => payeeEditController.payee.should.deep.equal(payee));

		it("should set the mode to Edit", (): Chai.Assertion => payeeEditController.mode.should.equal("Edit"));
	});

	describe("when a payee is not provided", (): void => {
		beforeEach((): PayeeEditController => (payeeEditController = controllerTest("PayeeEditController", { payee: undefined }) as PayeeEditController));

		it("should make an empty payee object available to the view", (): void => {
			payeeEditController.payee.should.be.an("object");
			payeeEditController.payee.should.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion => payeeEditController.mode.should.equal("Add"));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			payeeEditController.errorMessage = "error message";
			payeeEditController.save();
			(null === payeeEditController.errorMessage as string | null).should.be.true;
		});

		it("should save the payee", (): void => {
			payeeEditController.save();
			payeeModel.save.should.have.been.calledWith(payee);
		});

		it("should close the modal when the payee save is successful", (): void => {
			payeeEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(payee);
		});

		it("should display an error message when the payee save is unsuccessful", (): void => {
			payeeEditController.payee.id = -1;
			payeeEditController.save();
			(payeeEditController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			payeeEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
