(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootTransactions")
		.controller("TransactionFlagController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "transactionModel", "transaction"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, transactionModel, transaction) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.transaction = transaction;
		vm.flag = "(no memo)" === transaction.flag ? null : transaction.flag;
		vm.flagged = !!transaction.flag;
		vm.save = save;
		vm.deleteFlag = deleteFlag;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Save and close the modal
		function save() {
			vm.errorMessage = null;
			vm.transaction.flag = vm.flag && vm.flag || "(no memo)";
			transactionModel.flag(vm.transaction).then(function() {
				$modalInstance.close(vm.transaction);
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Delete and close the modal
		function deleteFlag() {
			vm.errorMessage = null;
			transactionModel.unflag(vm.transaction.id).then(function() {
				vm.transaction.flag = null;
				$modalInstance.close(vm.transaction);
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without deleting
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
