// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "~/og-components";
import "~/accounts";
import "~/categories";
import "~/payees";
import "~/securities";
import "~/transactions";

// Components
import EstimateFilter from "~/schedules/filters/estimate";
import ScheduleDeleteController from "~/schedules/controllers/delete";
import ScheduleEditController from "~/schedules/controllers/edit";
import ScheduleIndexController from "~/schedules/controllers/index";
import ScheduleModel from "~/schedules/models/schedule";
import angular from "angular";

angular
	.module("lootSchedules", [
		"ui.bootstrap",
		"ui.router",
		"ogComponents",
		"lootAccounts",
		"lootCategories",
		"lootPayees",
		"lootSecurities",
		"lootTransactions",
	])
	.controller("ScheduleDeleteController", ScheduleDeleteController)
	.controller("ScheduleEditController", ScheduleEditController)
	.controller("ScheduleIndexController", ScheduleIndexController)
	.filter("estimate", EstimateFilter.factory)
	.service("scheduleModel", ScheduleModel);
