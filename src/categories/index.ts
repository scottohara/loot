// Dependent modules
import "angular-ui-bootstrap";
import "@uirouter/angularjs";
import "~/og-components";

// Components
import CategoryDeleteController from "~/categories/controllers/delete";
import CategoryEditController from "~/categories/controllers/edit";
import CategoryIndexController from "~/categories/controllers/index";
import CategoryModel from "~/categories/models/category";
import angular from "angular";

angular
	.module("lootCategories", ["ui.bootstrap", "ui.router", "ogComponents"])
	.controller("CategoryDeleteController", CategoryDeleteController)
	.controller("CategoryEditController", CategoryEditController)
	.controller("CategoryIndexController", CategoryIndexController)
	.service("categoryModel", CategoryModel);
