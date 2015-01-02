(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputAutoselect", function() {
		// The object under test
		var ogInputAutoselect;

		// Dependencies
		var $timeout;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(_$timeout_, directiveTest) {
			$timeout = _$timeout_;
			ogInputAutoselect = directiveTest;
			ogInputAutoselect.configure("og-input-autoselect", "input");
			ogInputAutoselect.compile();
		}));

		describe("on focus", function() {
			var mockJQueryInstance,
					realJQueryInstance;

			beforeEach(function() {
				mockJQueryInstance = {
					select: sinon.stub()
				};

				realJQueryInstance = window.$;
				window.$ = sinon.stub();
				window.$.withArgs(ogInputAutoselect.element).returns(mockJQueryInstance);

				ogInputAutoselect.element.triggerHandler("focus");
				$timeout.flush();
			});

			it("should select the input value", function() {
				mockJQueryInstance.select.should.have.been.called;
			});

			afterEach(function() {
				$timeout.verifyNoPendingTasks();
				window.$ = realJQueryInstance;
			});
		});
	});
})();
