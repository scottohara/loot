(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputAutoselect", function() {
		// The object under test
		var ogInputAutoselect;

		// Dependencies
		var $timeout,
				mockJQueryInstance,
				realJQueryInstance;


		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(_$timeout_, directiveTest) {
			$timeout = _$timeout_;
			ogInputAutoselect = directiveTest;
			ogInputAutoselect.configure("og-input-autoselect", "input");
			ogInputAutoselect.compile();

			mockJQueryInstance = {
				select: sinon.stub()
			};

			realJQueryInstance = window.$;
			window.$ = sinon.stub();
			window.$.withArgs(ogInputAutoselect.element).returns(mockJQueryInstance);
		}));

		describe("on focus", function() {
			beforeEach(function() {
				ogInputAutoselect.element.triggerHandler("focus");
				$timeout.flush();
			});

			it("should select the input value", function() {
				mockJQueryInstance.select.should.have.been.called;
			});
		});

		describe("on destroy", function() {
			beforeEach(function() {
				ogInputAutoselect.element.triggerHandler("$destroy");
				ogInputAutoselect.scope.$digest();
			});

			it("should remove the focus handler from the element", function() {
				ogInputAutoselect.element.triggerHandler("focus");
				$timeout.flush();
				mockJQueryInstance.select.should.not.have.been.called;
			});
		});

		afterEach(function() {
			$timeout.verifyNoPendingTasks();
			window.$ = realJQueryInstance;
		});
	});
})();
