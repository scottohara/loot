// Components
import CategoriesMockProvider from "./providers/categories";
import CategoryMockProvider from "./providers/category";
import CategoryModelMockProvider from "./models/category";
import angular from "angular";

angular.module("lootCategoriesMocks", [])
	.provider("categoriesMock", CategoriesMockProvider)
	.provider("categoryMock", CategoryMockProvider)
	.provider("categoryModelMock", CategoryModelMockProvider);
