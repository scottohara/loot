(function() {
	"use strict";

	/*jshint expr: true */

	describe("categoryModel", function() {
		// The object under test
		var categoryModel;

		// Dependencies
		var $httpBackend,
				$http,
				$cacheFactory,
				$cache,
				$window,
				ogLruCacheFactory,
				ogLruCache;

		// Load the modules
		beforeEach(module("lootMocks", "categories", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"]);
		}));

		// Inject any dependencies that need to be configured first
		beforeEach(inject(function(_$window_) {
			$window = _$window_;
			$window.localStorage.getItem.withArgs("lootRecentCategories").returns(null);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_categoryModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) {
			categoryModel = _categoryModel_;

			$httpBackend = _$httpBackend_;
			$http = _$http_;

			$cacheFactory = _$cacheFactory_;
			$cache = $cacheFactory();

			ogLruCacheFactory = _ogLruCacheFactory_;
			ogLruCache = ogLruCacheFactory();
		}));

		// After each spec, verify that there are no outstanding http expectations or requests
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it ("should fetch the list of recent categories from localStorage", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootRecentCategories");
		});

		it("should have a list of recent categories", function() {
			ogLruCache.list.should.have.been.called;
			categoryModel.recent.should.equal("recent list");
		});

		describe("type", function() {
			it("should be 'category'", function() {
				categoryModel.type().should.equal("category");
			});
		});

		describe("path", function() {
			it("should return the categories collection path when an id is not provided", function() {
				categoryModel.path().should.equal("/categories");
			});

			it("should return a specific category path when an id is provided", function() {
				categoryModel.path(123).should.equal("/categories/123");
			});
		});

		describe("all", function() {
			var expectedUrl = /categories\?parent=parent$/,
					expectedResponse = "categories without children";

			it("should dispatch a GET request to /categories?parent={parent}", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				categoryModel.all("parent");
				$httpBackend.flush();
			});
			
			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				categoryModel.all();
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should return a list of all categories without their children", function() {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				categoryModel.all("parent").should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});

			describe("(include children)", function() {
				beforeEach(function() {
					expectedUrl = /categories\?include_children\&parent=parent/;
					expectedResponse = "categories with children";
				});

				it("should dispatch a GET request to /categories?include_children&parent={parent}", function() {
					$httpBackend.expect("GET", expectedUrl).respond(200);
					categoryModel.all("parent", true);
					$httpBackend.flush();
				});
				
				it("should not cache the response in the $http cache", function() {
					var httpGet = sinon.stub($http, "get").returns({
						then: function() {}
					});

					categoryModel.all("parent", true);
					httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
				});

				it("should return a list of all categories including their children", function() {
					$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
					categoryModel.all("parent", true).should.eventually.equal(expectedResponse);
					$httpBackend.flush();
				});
			});
		});

		describe("allWithChildren", function() {
			var expected = "categories with children";

			beforeEach(function() {
				categoryModel.all = sinon.stub().returns(expected);
			});

			it("should call categoryModel.all(true)", function() {
				categoryModel.allWithChildren("parent");
				categoryModel.all.should.have.been.calledWith("parent", true);
			});

			it("should return a list of all categories including their children", function() {
				categoryModel.allWithChildren("parent").should.equal(expected);
			});
		});

		describe("find", function() {
			var expectedUrl = /categories\/123/,
					expectedResponse = "category details";

			beforeEach(function() {
				categoryModel.addRecent = sinon.stub();
			});

			it("should dispatch a GET request to /categories/{id}", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				categoryModel.find(123);
				$httpBackend.flush();
			});

			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				categoryModel.find(123);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should add the category to the recent list", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				categoryModel.find(123);
				$httpBackend.flush();
				categoryModel.addRecent.should.have.been.calledWith(expectedResponse);
			});

			it("should return the category", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				categoryModel.find(123).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});

		describe("save", function() {
			beforeEach(function() {
				categoryModel.flush = sinon.stub();
				$httpBackend.whenPOST(/categories$/, {}).respond(200);
				$httpBackend.whenPATCH(/categories\/123$/, {id: 123}).respond(200);
			});

			it("should flush the category cache", function() {
				categoryModel.save({});
				categoryModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /categories when an id is not provided", function() {
				$httpBackend.expectPOST(/categories$/);
				categoryModel.save({});
				$httpBackend.flush();
			});

			it("should dispatch a PATCH request to /categories/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/categories\/123$/);
				categoryModel.save({id: 123});
				$httpBackend.flush();
			});
		});

		describe("destroy", function() {
			beforeEach(function() {
				categoryModel.flush = sinon.stub();
				$httpBackend.expectDELETE(/categories\/123$/).respond(200);
				categoryModel.destroy({id: 123});
				$httpBackend.flush();
			});

			it("should flush the category cache", function() {
				categoryModel.flush.should.have.been.called;
			});

			it("should dispatch a DELETE request to /categories/{id}", function() {
			});
		});

		describe("flush", function() {
			it("should flush the category cache", function() {
				categoryModel.flush();
				$cache.removeAll.should.have.been.called;
			});
		});

		describe("addRecent", function() {
			beforeEach(function() {
				categoryModel.addRecent("category");
			});

			it("should add the category to the recent list", function() {
				ogLruCache.put.should.have.been.calledWith("category");
				categoryModel.recent.should.equal("updated list");
			});

			it("should save the updated recent list", function() {
				$window.localStorage.setItem.should.have.been.calledWith("lootRecentCategories", "{}");
			});
		});
	});
})();
