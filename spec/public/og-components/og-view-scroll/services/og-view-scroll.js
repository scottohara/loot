(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogViewScrollService", function() {
		// The object under test
		var ogViewScrollService;

		// Dependencies
		var $uiViewScroll,
				mockJQueryInstance,
				realJQueryInstance;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$uiViewScroll"]);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_ogViewScrollService_, _$uiViewScroll_) {
			ogViewScrollService = _ogViewScrollService_;
			$uiViewScroll = _$uiViewScroll_;

			mockJQueryInstance = {};
			realJQueryInstance = window.$;
			window.$ = sinon.stub();
			window.$.withArgs("#test").returns(mockJQueryInstance);
		}));

		afterEach(function() {
			window.$ = realJQueryInstance;
		});

		describe("scrollTo", function() {
			it("should scroll to the specified anchor", function() {
				ogViewScrollService.scrollTo("test");
				$uiViewScroll.should.have.been.calledWith(mockJQueryInstance);
			});
		});
	});
})();
