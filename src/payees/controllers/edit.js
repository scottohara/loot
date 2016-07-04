{
	/**
	 * Implementation
	 */
	class PayeeEditController {
		constructor($uibModalInstance, payeeModel, payee) {
			this.$uibModalInstance = $uibModalInstance;
			this.payeeModel = payeeModel;
			this.payee = angular.extend({}, payee);
			this.mode = payee ? "Edit" : "Add";
			this.errorMessage = null;
		}

		// Save and close the modal
		save() {
			this.errorMessage = null;
			this.payeeModel.save(this.payee).then(payee => this.$uibModalInstance.close(payee.data), error => (this.errorMessage = error.data));
		}

		// Dismiss the modal without saving
		cancel() {
			this.$uibModalInstance.dismiss();
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootPayees")
		.controller("PayeeEditController", PayeeEditController);

	/**
	 * Dependencies
	 */
	PayeeEditController.$inject = ["$uibModalInstance", "payeeModel", "payee"];
}
