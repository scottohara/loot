// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "og-components";

// Components
import CategoryDeleteController from "./controllers/delete";
import CategoryEditController from "./controllers/edit";
import CategoryIndexController from "./controllers/index";
import CategoryModel from "./models/category";
import angular from "angular";

angular.module("lootCategories", [
	"ui.bootstrap",
	"ui.router",
	"ogComponents"
])
	.controller("CategoryDeleteController", CategoryDeleteController)
	.controller("CategoryEditController", CategoryEditController)
	.controller("CategoryIndexController", CategoryIndexController)
	.service("categoryModel", CategoryModel);