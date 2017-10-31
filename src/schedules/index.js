// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "og-components";
import "accounts";
import "categories";
import "payees";
import "securities";
import "transactions";

// Components
import EstimateFilter from "./filters/estimate";
import ScheduleDeleteController from "./controllers/delete";
import ScheduleEditController from "./controllers/edit";
import ScheduleIndexController from "./controllers/index";
import ScheduleModel from "./models/schedule";
import angular from "angular";

angular.module("lootSchedules", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents",
	"lootAccounts",
	"lootCategories",
	"lootPayees",
	"lootSecurities",
	"lootTransactions"
])
	.controller("ScheduleDeleteController", ScheduleDeleteController)
	.controller("ScheduleEditController", ScheduleEditController)
	.controller("ScheduleIndexController", ScheduleIndexController)
	.filter("estimate", EstimateFilter.factory)
	.service("scheduleModel", ScheduleModel);