describe("categoryModel", () => {
	let	categoryModel,
			$httpBackend,
			$http,
			$cache,
			$window,
			ogLruCache;

	// Load the modules
	beforeEach(module("lootMocks", "lootCategories", mockDependenciesProvider => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject(_$window_ => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentCategories").returns(null);
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_categoryModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) => {
		categoryModel = _categoryModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		const	$cacheFactory = _$cacheFactory_,
					ogLruCacheFactory = _ogLruCacheFactory_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory();
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach(() => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent categories from localStorage", () => $window.localStorage.getItem.should.have.been.calledWith("lootRecentCategories"));

	it("should have a list of recent categories", () => {
		ogLruCache.list.should.have.been.called;
		categoryModel.recent.should.equal("recent list");
	});

	describe("LRU_LOCAL_STORAGE_KEY", () => {
		it("should be 'lootRecentCategories'", () => categoryModel.LRU_LOCAL_STORAGE_KEY.should.equal("lootRecentCategories"));
	});

	describe("type", () => {
		it("should be 'category'", () => categoryModel.type.should.equal("category"));
	});

	describe("path", () => {
		it("should return the categories collection path when an id is not provided", () => categoryModel.path().should.equal("/categories"));

		it("should return a specific category path when an id is provided", () => categoryModel.path(123).should.equal("/categories/123"));
	});

	describe("all", () => {
		let expectedUrl = /categories\?parent=parent$/,
				expectedResponse = "categories without children";

		it("should dispatch a GET request to /categories?parent={parent}", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			categoryModel.all("parent");
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			categoryModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all categories without their children", () => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			categoryModel.all("parent").should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(include children)", () => {
			beforeEach(() => {
				expectedUrl = /categories\?include_children\&parent=parent/;
				expectedResponse = "categories with children";
			});

			it("should dispatch a GET request to /categories?include_children&parent={parent}", () => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				categoryModel.all("parent", true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", () => {
				const httpGet = sinon.stub($http, "get").returns({
					then() {
						// Do nothing
					}
				});

				categoryModel.all("parent", true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all categories including their children", () => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				categoryModel.all("parent", true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithChildren", () => {
		const expected = "categories with children";

		beforeEach(() => categoryModel.all = sinon.stub().returns(expected));

		it("should fetch the list of categories with children", () => {
			categoryModel.allWithChildren("parent");
			categoryModel.all.should.have.been.calledWith("parent", true);
		});

		it("should return a list of all categories including their children", () => categoryModel.allWithChildren("parent").should.equal(expected));
	});

	describe("find", () => {
		const	expectedUrl = /categories\/123/,
					expectedResponse = "category details";

		beforeEach(() => categoryModel.addRecent = sinon.stub());

		it("should dispatch a GET request to /categories/{id}", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			categoryModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			categoryModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the category to the recent list", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			categoryModel.find(123);
			$httpBackend.flush();
			categoryModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the category", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			categoryModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", () => {
		beforeEach(() => {
			categoryModel.flush = sinon.stub();
			$httpBackend.whenPOST(/categories$/, {}).respond(200);
			$httpBackend.whenPATCH(/categories\/123$/, {id: 123}).respond(200);
		});

		it("should flush the category cache", () => {
			categoryModel.save({});
			categoryModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /categories when an id is not provided", () => {
			$httpBackend.expectPOST(/categories$/);
			categoryModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /categories/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/categories\/123$/);
			categoryModel.save({id: 123});
			$httpBackend.flush();
		});
	});

	describe("destroy", () => {
		beforeEach(() => {
			categoryModel.flush = sinon.stub();
			categoryModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/categories\/123$/).respond(200);
			categoryModel.destroy({id: 123});
			$httpBackend.flush();
		});

		it("should flush the category cache", () => categoryModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /categories/{id}", () => null);

		it("should remove the category from the recent list", () => categoryModel.removeRecent.should.have.been.calledWith(123));
	});

	describe("flush", () => {
		it("should remove the specified category from the category cache when an id is provided", () => {
			categoryModel.flush(1);
			$cache.remove.should.have.been.calledWith("/categories/1");
		});

		it("should flush the category cache when an id is not provided", () => {
			categoryModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", () => {
		beforeEach(() => categoryModel.addRecent("category"));

		it("should add the category to the recent list", () => {
			ogLruCache.put.should.have.been.calledWith("category");
			categoryModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentCategories", "{}"));
	});

	describe("removeRecent", () => {
		beforeEach(() => categoryModel.removeRecent("category"));

		it("should remove the category from the recent list", () => {
			ogLruCache.remove.should.have.been.calledWith("category");
			categoryModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentCategories", "{}"));
	});
});
