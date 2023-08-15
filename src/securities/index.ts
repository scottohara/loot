// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "~/og-components";

// Components
import SecurityDeleteController from "~/securities/controllers/delete";
import SecurityEditController from "~/securities/controllers/edit";
import SecurityIndexController from "~/securities/controllers/index";
import SecurityModel from "~/securities/models/security";
import angular from "angular";

angular.module("lootSecurities", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents"
])
	.controller("SecurityDeleteController", SecurityDeleteController)
	.controller("SecurityEditController", SecurityEditController)
	.controller("SecurityIndexController", SecurityIndexController)
	.service("securityModel", SecurityModel);