import type {
	CacheFactoryMock,
	WindowMock,
} from "~/mocks/node-modules/angular/types";
import type AuthenticationModel from "~/authentication/models/authentication";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { SinonStub } from "sinon";
import angular from "angular";

describe("authenticationModel", (): void => {
	let authenticationModel: AuthenticationModel,
		$httpBackend: angular.IHttpBackendService,
		$http: angular.IHttpService,
		$cacheFactory: CacheFactoryMock,
		$cache: angular.ICacheObject,
		$window: WindowMock;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootAuthentication",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load(["$cacheFactory", "$window"]),
		) as Mocha.HookFunction,
	);

	// Inject the object under test and the $httpBackend
	beforeEach(
		angular.mock.inject(
			(
				_authenticationModel_: AuthenticationModel,
				_$httpBackend_: angular.IHttpBackendService,
				_$http_: angular.IHttpService,
				_$cacheFactory_: CacheFactoryMock,
				_$window_: WindowMock,
			): void => {
				authenticationModel = _authenticationModel_;

				$httpBackend = _$httpBackend_;
				$http = _$http_;

				$cacheFactory = _$cacheFactory_;
				$cache = $cacheFactory();

				$window = _$window_;
			},
		) as Mocha.HookFunction,
	);

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	describe("SESSION_STORAGE_KEY", (): void => {
		it("should be 'lootAuthenticationKey'", (): Chai.Assertion =>
			expect(authenticationModel["SESSION_STORAGE_KEY"]).to.equal(
				"lootAuthenticationKey",
			));
	});

	describe("isAuthenticated", (): void => {
		let isAuthenticated: boolean;

		it("should fetch the authentication key from sessionStorage", (): void => {
			({ isAuthenticated } = authenticationModel);
			expect($window.sessionStorage.getItem).to.have.been.calledWith(
				"lootAuthenticationKey",
			);
		});

		describe("when authenticated", (): void => {
			beforeEach(
				(): SinonStub =>
					$window.sessionStorage.getItem.returns("authentication key"),
			);

			it("should set the default $http Authorization header", (): void => {
				$http.defaults = {};
				({ isAuthenticated } = authenticationModel);
				expect(
					($http.defaults.headers as angular.IHttpRequestConfigHeaders).common
						.Authorization,
				).to.equal("Basic authentication key");
			});

			it("should update the default $http Authorization header", (): void => {
				$http.defaults.headers = { common: { Authorization: "" } };
				({ isAuthenticated } = authenticationModel);
				expect($http.defaults.headers.common.Authorization).to.equal(
					"Basic authentication key",
				);
			});

			it("should be true", (): void => {
				({ isAuthenticated } = authenticationModel);
				expect(isAuthenticated).to.be.true;
			});
		});

		describe("when not authenticated", (): void => {
			it("should be false", (): Chai.Assertion =>
				expect(authenticationModel.isAuthenticated).to.be.false);
		});
	});

	describe("login", (): void => {
		beforeEach((): void => {
			$httpBackend
				.expectPOST(
					/logins/u,
					"",
					(headers: angular.IHttpRequestConfigHeaders): boolean =>
						"Basic base64 encoded" === headers.Authorization,
				)
				.respond(200, "authentication key");
			authenticationModel.login("username", "password");
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /logins, containing an Authorization header", (): null =>
			null);

		it("should save the authentication key to sessionStorage", (): Chai.Assertion =>
			expect($window.sessionStorage.setItem).to.have.been.calledWith(
				"lootAuthenticationKey",
				"base64 encoded",
			));

		it("should set the default $http Authorization header", (): Chai.Assertion =>
			expect(
				($http.defaults.headers as angular.IHttpRequestConfigHeaders).common
					.Authorization,
			).to.equal("Basic base64 encoded"));
	});

	describe("logout", (): void => {
		beforeEach((): void => authenticationModel.logout());

		it("should remove the authentication key from sessionStorage", (): Chai.Assertion =>
			expect($window.sessionStorage.removeItem).to.have.been.calledWith(
				"lootAuthenticationKey",
			));

		it("should clear the default $http Authorization header", (): Chai.Assertion =>
			expect(
				($http.defaults.headers as angular.IHttpRequestConfigHeaders).common
					.Authorization,
			).to.equal("Basic "));

		it("should clear all $http caches except the template cache", (): void => {
			expect($cache["removeAll"]).to.have.been.called;
			expect(($cacheFactory.get as SinonStub)("templates").removeAll).to.not
				.have.been.called;
		});
	});
});
