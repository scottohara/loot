// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "og-components";
import "accounts";
import "categories";
import "payees";
import "securities";

// Components
import QueryService from "./services/query";
import TransactionDeleteController from "./controllers/delete";
import TransactionEditController from "./controllers/edit";
import TransactionFlagController from "./controllers/flag";
import TransactionIndexController from "./controllers/index";
import TransactionModel from "./models/transaction";
import TransactionStatusDirective from "./directives/status";
import angular from "angular";

angular.module("lootTransactions", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents",
	"lootAccounts",
	"lootCategories",
	"lootPayees",
	"lootSecurities"
])
	.controller("TransactionDeleteController", TransactionDeleteController)
	.controller("TransactionEditController", TransactionEditController)
	.controller("TransactionFlagController", TransactionFlagController)
	.controller("TransactionIndexController", TransactionIndexController)
	.directive("transactionStatus", TransactionStatusDirective.factory)
	.service("transactionModel", TransactionModel)
	.service("queryService", QueryService);