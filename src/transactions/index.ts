// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "~/og-components";
import "~/accounts";
import "~/categories";
import "~/payees";
import "~/securities";

// Components
import QueryService from "~/transactions/services/query";
import TransactionDeleteController from "~/transactions/controllers/delete";
import TransactionEditController from "~/transactions/controllers/edit";
import TransactionFlagController from "~/transactions/controllers/flag";
import TransactionFlagDirective from "~/transactions/directives/flag";
import TransactionIndexController from "~/transactions/controllers/index";
import TransactionModel from "~/transactions/models/transaction";
import TransactionStatusDirective from "~/transactions/directives/status";
import angular from "angular";

angular
	.module("lootTransactions", [
		"ui.bootstrap",
		"ui.router",
		"ogComponents",
		"lootAccounts",
		"lootCategories",
		"lootPayees",
		"lootSecurities",
	])
	.controller("TransactionDeleteController", TransactionDeleteController)
	.controller("TransactionEditController", TransactionEditController)
	.controller("TransactionFlagController", TransactionFlagController)
	.controller("TransactionIndexController", TransactionIndexController)
	.directive("transactionFlag", TransactionFlagDirective.factory)
	.directive("transactionStatus", TransactionStatusDirective.factory)
	.service("transactionModel", TransactionModel)
	.service("queryService", QueryService);
