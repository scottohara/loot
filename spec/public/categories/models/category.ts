import type {
	CacheFactoryMock,
	WindowMock
} from "mocks/node-modules/angular/types";
import type {
	OgLruCacheFactoryMock,
	OgLruCacheMock
} from "mocks/og-components/og-lru-cache-factory/types";
import type { Category } from "categories/types";
import type CategoryModel from "categories/models/category";
import type MockDependenciesProvider from "mocks/loot/mockdependencies";
import type { OgCacheEntry } from "og-components/og-lru-cache-factory/types";
import type { SinonStub } from "sinon";
import angular from "angular";
import createCategory from "mocks/categories/factories";
import sinon from "sinon";

describe("categoryModel", (): void => {
	let	categoryModel: CategoryModel,
			$httpBackend: angular.IHttpBackendService,
			$http: angular.IHttpService,
			$cache: angular.ICacheObject,
			$window: WindowMock,
			ogLruCache: OgLruCacheMock,
			category: Category,
			iPromise: angular.IPromise<never>,
			iHttpPromise: angular.IHttpPromise<unknown>;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootCategories", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory", "iPromise", "iHttpPromise"])) as Mocha.HookFunction);

	// Inject any dependencies that need to be configured first
	beforeEach(angular.mock.inject((_$window_: WindowMock): void => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentCategories").returns(null);
	}) as Mocha.HookFunction);

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_categoryModel_: CategoryModel, _$httpBackend_: angular.IHttpBackendService, _$http_: angular.IHttpService, $cacheFactory: CacheFactoryMock, ogLruCacheFactory: OgLruCacheFactoryMock, _iPromise_: angular.IPromise<never>, _iHttpPromise_: angular.IHttpPromise<unknown>): void => {
		categoryModel = _categoryModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory.new();
		iPromise = _iPromise_;
		iHttpPromise = _iHttpPromise_;

		category = createCategory({ id: 1 });
	}) as Mocha.HookFunction);

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent categories from localStorage", (): Chai.Assertion => $window.localStorage.getItem.should.have.been.calledWith("lootRecentCategories"));

	it("should have a list of recent categories", (): Chai.Assertion => categoryModel.recent.should.deep.equal([{ id: 1, name: "recent item" }]));

	describe("LRU_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootRecentCategories'", (): Chai.Assertion => categoryModel.LRU_LOCAL_STORAGE_KEY.should.equal("lootRecentCategories"));
	});

	describe("recentCategories", (): void => {
		describe("when localStorage is not null", (): void => {
			let recentCategories: OgCacheEntry[];

			beforeEach((): void => {
				recentCategories = [{ id: 1, name: "recent item" }];
				$window.localStorage.getItem.withArgs("lootRecentCategories").returns(JSON.stringify(recentCategories));
			});

			it("should return an array of cache entries", (): Chai.Assertion => categoryModel["recentCategories"].should.deep.equal(recentCategories));
		});

		describe("when localStorage is null", (): void => {
			it("should return an empty array", (): Chai.Assertion => categoryModel["recentCategories"].should.deep.equal([]));
		});
	});

	describe("type", (): void => {
		it("should be 'category'", (): Chai.Assertion => categoryModel.type.should.equal("category"));
	});

	describe("path", (): void => {
		it("should return the categories collection path when an id is not provided", (): Chai.Assertion => categoryModel.path().should.equal("/categories"));

		it("should return a specific category path when an id is provided", (): Chai.Assertion => categoryModel.path(123).should.equal("/categories/123"));
	});

	describe("all", (): void => {
		let expectedUrl = /categories\?parent=1$/u,
				expectedResponse = "categories without children";

		it("should dispatch a GET request to /categories?parent={parent}", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			categoryModel.all(1);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			categoryModel.all();
			httpGet.firstCall.args[1].should.have.an.own.property("cache").that.is.not.false;
		});

		it("should return a list of all categories without their children", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
			categoryModel.all(1).then((categories: Category[]): Chai.Assertion => categories.should.equal(expectedResponse));
			$httpBackend.flush();
		});

		describe("(include children)", (): void => {
			beforeEach((): void => {
				expectedUrl = /categories\?include_children&parent=1/u;
				expectedResponse = "categories with children";
			});

			it("should dispatch a GET request to /categories?include_children&parent={parent}", (): void => {
				$httpBackend.expectGET(expectedUrl).respond(200);
				categoryModel.all(1, true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

				categoryModel.all(1, true);
				httpGet.firstCall.args[1].should.have.an.own.property("cache").that.is.false;
			});

			it("should return a list of all categories including their children", (): void => {
				$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
				categoryModel.all(1, true).then((categories: Category[]): Chai.Assertion => categories.should.equal(expectedResponse));
				$httpBackend.flush();
			});
		});
	});

	describe("allWithChildren", (): void => {
		beforeEach((): SinonStub => sinon.stub(categoryModel, "all").returns(iPromise));

		it("should fetch the list of categories with children", (): void => {
			categoryModel.allWithChildren(1);
			categoryModel.all.should.have.been.calledWith(1, true);
		});

		it("should return a list of all categories including their children", (): Chai.Assertion => categoryModel.allWithChildren(1).should.equal(iPromise));
	});

	describe("find", (): void => {
		const	expectedUrl = /categories\/123/u,
					expectedResponse = "category details";

		beforeEach((): SinonStub => sinon.stub(categoryModel, "addRecent"));

		it("should dispatch a GET request to /categories/{id}", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			categoryModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			categoryModel.find(123);
			httpGet.firstCall.args[1].should.have.an.own.property("cache").that.is.not.false;
		});

		it("should add the category to the recent list", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			categoryModel.find(123);
			$httpBackend.flush();
			categoryModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the category", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			categoryModel.find(123).then((foundCategory: Category): Chai.Assertion => foundCategory.should.equal(expectedResponse));
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		const expectedPostUrl = /categories$/u,
					expectedPatchUrl = /categories\/1$/u;

		beforeEach((): void => {
			sinon.stub(categoryModel, "flush");
			$httpBackend.whenPOST(expectedPostUrl, category).respond(200);
			$httpBackend.whenPATCH(expectedPatchUrl, category).respond(200);
		});

		it("should flush the category cache", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
			categoryModel.save(category);
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /categories when an id is not provided", (): void => {
			delete category.id;
			$httpBackend.expectPOST(expectedPostUrl);
			categoryModel.save(category);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /categories/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
			categoryModel.save(category);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(categoryModel, "flush");
			sinon.stub(categoryModel, "removeRecent");
			$httpBackend.expectDELETE(/categories\/1$/u).respond(200);
			categoryModel.destroy(category);
			$httpBackend.flush();
		});

		it("should flush the category cache", (): Chai.Assertion => categoryModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /categories/{id}", (): null => null);

		it("should remove the category from the recent list", (): Chai.Assertion => categoryModel.removeRecent.should.have.been.calledWith(1));
	});

	describe("toggleFavourite", (): void => {
		const expectedUrl = /categories\/1\/favourite$/u;

		beforeEach((): void => {
			sinon.stub(categoryModel, "flush");
			$httpBackend.whenDELETE(expectedUrl).respond(200);
			$httpBackend.whenPUT(expectedUrl).respond(200);
		});

		it("should flush the category cache", (): void => {
			categoryModel.toggleFavourite(category);
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /categories/{id}/favourite when the category is unfavourited", (): void => {
			$httpBackend.expectDELETE(expectedUrl);
			category.favourite = true;
			categoryModel.toggleFavourite(category).then((favourite: boolean): Chai.Assertion => favourite.should.be.false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /categories/{id}/favourite when the category is favourited", (): void => {
			$httpBackend.expectPUT(expectedUrl);
			categoryModel.toggleFavourite(category).then((favourite: boolean): Chai.Assertion => favourite.should.be.true);
			$httpBackend.flush();
		});
	});

	describe("flush", (): void => {
		it("should remove the specified category from the category cache when an id is provided", (): void => {
			categoryModel.flush(1);
			$cache.remove.should.have.been.calledWith("/categories/1");
		});

		it("should flush the category cache when an id is not provided", (): void => {
			categoryModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => categoryModel.addRecent(category));

		it("should add the category to the recent list", (): void => {
			ogLruCache.put.should.have.been.calledWith(category);
			categoryModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentCategories", JSON.stringify([{ id: 1, name: "recent item" }])));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => categoryModel.removeRecent(1));

		it("should remove the category from the recent list", (): void => {
			ogLruCache.remove.should.have.been.calledWith(1);
			categoryModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentCategories", JSON.stringify([{ id: 1, name: "recent item" }])));
	});
});
