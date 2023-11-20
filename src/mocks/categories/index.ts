// Components
import CategoriesMockProvider from "~/mocks/categories/providers/categories";
import CategoryMockProvider from "~/mocks/categories/providers/category";
import CategoryModelMockProvider from "~/mocks/categories/models/category";
import angular from "angular";

angular
	.module("lootCategoriesMocks", [])
	.provider("categoriesMock", CategoriesMockProvider)
	.provider("categoryMock", CategoryMockProvider)
	.provider("categoryModelMock", CategoryModelMockProvider);
