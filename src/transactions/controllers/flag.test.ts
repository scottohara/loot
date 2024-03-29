import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Transaction } from "~/transactions/types";
import type TransactionFlagController from "~/transactions/controllers/flag";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("TransactionFlagController", (): void => {
	let transactionFlagController: TransactionFlagController,
		controllerTest: ControllerTestFactory,
		$uibModalInstance: UibModalInstanceMock,
		transactionModel: TransactionModelMock,
		transaction: Transaction;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"transactionModel",
					"transaction",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_transactionModel_: TransactionModelMock,
				_transaction_: Transaction,
			): void => {
				controllerTest = _controllerTest_;
				$uibModalInstance = _$uibModalInstance_;
				transactionModel = _transactionModel_;
				transaction = _transaction_;
				transactionFlagController = controllerTest(
					"TransactionFlagController",
				) as TransactionFlagController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed transaction available to the view", (): Chai.Assertion =>
		expect(transactionFlagController["transaction"]).to.deep.equal(
			transaction,
		));

	it("should make the passed transaction's flag type available to the view", (): void => {
		transaction.flag_type = "noreceipt";
		transactionFlagController = controllerTest(
			"TransactionFlagController",
		) as TransactionFlagController;
		expect(transactionFlagController.flagType as string).to.equal(
			transaction.flag_type,
		);
	});

	it("should make the passed transaction's flag memo available to the view", (): Chai.Assertion =>
		expect(transactionFlagController.flag as string).to.equal(
			transaction.flag,
		));

	it("should default the flag type when transaction doesn't have a flag", (): void => {
		transaction.flag_type = undefined;
		transactionFlagController = controllerTest(
			"TransactionFlagController",
		) as TransactionFlagController;
		expect(String(transactionFlagController.flagType)).to.equal("followup");
	});

	it("should set the flag to an empty string when transaction's flag memo is '(no memo)'", (): void => {
		transaction.flag = "(no memo)";
		transactionFlagController = controllerTest(
			"TransactionFlagController",
		) as TransactionFlagController;
		expect(String(transactionFlagController.flag)).to.equal("");
	});

	it("should set the flagged property when the transaction has a flag", (): Chai.Assertion =>
		expect(transactionFlagController.flagged).to.be.true);

	it("should clear the flagged property when the transaction doesn't have a flag", (): void => {
		transaction.flag = null;
		transactionFlagController = controllerTest(
			"TransactionFlagController",
		) as TransactionFlagController;
		expect(transactionFlagController.flagged).to.be.false;
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			transactionFlagController.errorMessage = "error message";
			transactionFlagController.save();
			expect(transactionFlagController.errorMessage as string | null).to.be
				.null;
		});

		it("should flag the transaction", (): void => {
			transactionFlagController.save();
			expect(transactionModel.flag).to.have.been.calledWith(transaction);
		});

		it("should set the flag memo to '(no memo)' if the memo is blank", (): void => {
			transactionFlagController.flag = "";
			transaction.flag = "(no memo)";
			transactionFlagController.save();
			expect(transactionModel.flag).to.have.been.calledWith(transaction);
		});

		it("should close the modal when the flag save is successful", (): void => {
			transactionFlagController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(transaction);
		});

		it("should display an error message when the flag save is unsuccessful", (): void => {
			transactionFlagController["transaction"].id = -1;
			transactionFlagController.save();
			expect(transactionFlagController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("deleteFlag", (): void => {
		it("should reset any previous error messages", (): void => {
			transactionFlagController.errorMessage = "error message";
			transactionFlagController.deleteFlag();
			expect(transactionFlagController.errorMessage as string | null).to.be
				.null;
		});

		it("should unflag the transaction", (): void => {
			transactionFlagController.deleteFlag();
			expect(transactionModel.unflag).to.have.been.calledWith(transaction.id);
		});

		it("should clear transaction's flag", (): void => {
			transactionFlagController.deleteFlag();
			expect(transactionFlagController["transaction"].flag_type).to.be.null;
			expect(transactionFlagController["transaction"].flag).to.be.null;
		});

		it("should close the modal when the flag delete is successful", (): void => {
			transactionFlagController.deleteFlag();
			expect($uibModalInstance.close).to.have.been.calledWith(transaction);
		});

		it("should display an error message when the flag delete is unsuccessful", (): void => {
			transactionFlagController["transaction"].id = -1;
			transactionFlagController.deleteFlag();
			expect(transactionFlagController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			transactionFlagController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
