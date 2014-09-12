(function() {
	"use strict";

	/*jshint expr: true */

	describe("lootStatesProvider", function() {
		// Dependencies
		var	$rootScope,
				$state,
				$injector,
				$httpBackend,
				$modal,
				authenticationModel,
				accountModel,
				account,
				scheduleModel,
				schedules,
				payeeModel,
				payees,
				payee,
				categoryModel,
				categories,
				category,
				securityModel,
				securities,
				security,
				transactionModel,
				transactionBatch,
				stateName,
				stateConfig;

		// Load the modules
		beforeEach(module("states", "lootMocks", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "authenticationModel", "accountModel", "account", "scheduleModel", "schedules", "payeeModel", "payees", "payee", "categoryModel", "categories", "category", "securityModel", "securities", "security", "transactionModel", "transactionBatch"]);
		}));

		// Inject the object under test and it's dependencies
		beforeEach(inject(function(_lootStates_, _$rootScope_, _$state_, _$injector_, _$httpBackend_, _$modal_, _authenticationModel_, _accountModel_, _account_, _scheduleModel_, _schedules_, _payeeModel_, _payees_, _payee_, _categoryModel_, _categories_, _category_, _securityModel_, _securities_, _security_, _transactionModel_, _transactionBatch_) {
			$rootScope = _$rootScope_;
			$state = _$state_;
			$injector = _$injector_;
			$httpBackend = _$httpBackend_;
			$modal = _$modal_;
			authenticationModel = _authenticationModel_;
			accountModel = _accountModel_;
			account = _account_;
			scheduleModel = _scheduleModel_;
			schedules = _schedules_;
			payeeModel = _payeeModel_;
			payees = _payees_;
			payee = _payee_;
			categoryModel = _categoryModel_;
			categories = _categories_;
			category = _category_;
			securityModel = _securityModel_;
			securities = _securities_;
			security = _security_;
			transactionModel = _transactionModel_;
			transactionBatch = _transactionBatch_;
			$httpBackend.expectGET("loot/views/layout.html").respond(200);
		}));

		describe("root state", function() {
			beforeEach(function() {
				stateName = "root";
				stateConfig = $state.get(stateName);
			});

			it("should be abstract", function() {
				stateConfig.abstract.should.be.true;
			});

			it("should have a title", function() {
				stateConfig.data.title.should.equal("Welcome");
			});

			it("should resolve the authentication status of a logged in user", function() {
				$injector.invoke(stateConfig.resolve.authenticated);
				authenticationModel.isAuthenticated.should.have.been.called;
			});

			describe("(non-logged in user)", function() {
				beforeEach(function() {
					authenticationModel.isAuthenticated.returns(false);
					$injector.invoke(stateConfig.resolve.authenticated);
				});

				it("should resolve the authentication status of a non-logged in user and show the login modal", function() {
					authenticationModel.isAuthenticated.should.have.been.called;
					$modal.open.should.have.been.called;
				});

				it("should resolve the authentication status of a non-logged in user when the login modal is dismissed", function() {
					$modal.dismiss();
					$modal.catchCallback.should.have.been.called;
				});
			});
		});

		describe("accounts state", function() {
			beforeEach(function() {
				stateName = "root.accounts";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("accounts/views/index.html").respond(200);
			});
			
			it("should have a title", function() {
				stateConfig.data.title.should.equal("Accounts");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName).should.equal("#/accounts");
			});

			it("should succesfully transition", function() {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				$state.current.name.should.equal(stateName);
			});

			describe("account state", function() {
				beforeEach(function() {
					stateName += ".account";
				});

				it("should resolve to a URL", function() {
					$state.href(stateName, {id: 1}).should.equal("#/accounts/1");
				});

				it("should successfully transition", function() {
					$state.go(stateName);
					$rootScope.$digest();
					$httpBackend.flush();
					$state.current.name.should.equal(stateName);
				});

				describe("account transactions state", function() {
					beforeEach(function() {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", function() {
						stateConfig.data.title.should.equal("Account Transactions");
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {id: 1}).should.equal("#/accounts/1/transactions");
					});

					describe("(on transition)", function() {
						var resolvedContextModel,
								resolvedContext,
								resolvedTransactionBatch;

						beforeEach(function() {
							$state.go(stateName, {id: 1});
							$rootScope.$digest();
							$httpBackend.flush();
							resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
							resolvedContext = $injector.invoke($state.current.resolve.context, undefined, {contextModel: resolvedContextModel});
							resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, undefined, {contextModel: resolvedContextModel, context: resolvedContext});
						});

						it("should successfully transition", function() {
							$state.current.name.should.equal(stateName);
						});

						it("should resolve the parent context's model", function() {
							resolvedContextModel.should.equal(accountModel);
						});

						it("should resolve the parent context", function() {
							accountModel.find.should.have.been.calledWith(1);
							resolvedContext.should.deep.equal(account);
						});

						it("should resolve the transaction batch", function() {
							resolvedContextModel.isUnreconciledOnly.should.have.been.calledWith(resolvedContext.id);
							transactionModel.all.should.have.been.calledWith("/accounts/1", null, "prev", true);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("account transaction state", function() {
							beforeEach(function() {
								stateName += ".transaction";
							});

							it("should resolve to a URL", function() {
								$state.href(stateName, {id: 1, transactionId: 2}).should.equal("#/accounts/1/transactions/2");
							});

							it("should successfully transition", function() {
								$state.go(stateName);
								$rootScope.$digest();
								$state.current.name.should.equal(stateName);
							});
						});
					});
				});
			});
		});

		describe("schedules state", function() {
			beforeEach(function() {
				stateName = "root.schedules";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("schedules/views/index.html").respond(200);
			});
			
			it("should have a title", function() {
				stateConfig.data.title.should.equal("Schedules");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName).should.equal("#/schedules");
			});

			describe("(on transition)", function() {
				var resolvedSchedules;

				beforeEach(function() {
					$state.go(stateName);
					$rootScope.$digest();
					$httpBackend.flush();
					resolvedSchedules = $injector.invoke($state.current.resolve.schedules);
				});
				
				it("should successfully transition", function() {
					$state.current.name.should.equal(stateName);
				});

				it("should resolve the schedules", function() {
					scheduleModel.all.should.have.been.called;
					resolvedSchedules.should.deep.equal(schedules);
				});

				describe("schedule state", function() {
					beforeEach(function() {
						stateName += ".schedule";
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {id: 1}).should.equal("#/schedules/1");
					});

					it("should successfully transition", function() {
						$state.go(stateName);
						$rootScope.$digest();
						$state.current.name.should.equal(stateName);
					});
				});
			});
		});

		describe("payees state", function() {
			beforeEach(function() {
				stateName = "root.payees";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("payees/views/index.html").respond(200);
			});
			
			it("should have a title", function() {
				stateConfig.data.title.should.equal("Payees");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName).should.equal("#/payees");
			});

			describe("(on transition)", function() {
				var resolvedPayees;

				beforeEach(function() {
					$state.go(stateName);
					$rootScope.$digest();
					$httpBackend.flush();
					resolvedPayees = $injector.invoke($state.current.resolve.payees);
				});
				
				it("should successfully transition", function() {
					$state.current.name.should.equal(stateName);
				});

				it("should resolve the payees", function() {
					payeeModel.all.should.have.been.called;
					resolvedPayees.should.eventually.deep.equal(payees);
				});

				describe("payee state", function() {
					beforeEach(function() {
						stateName += ".payee";
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {id: 1}).should.equal("#/payees/1");
					});

					it("should successfully transition", function() {
						$state.go(stateName);
						$rootScope.$digest();
						$state.current.name.should.equal(stateName);
					});

					describe("payee transactions state", function() {
						beforeEach(function() {
							stateName += ".transactions";
							stateConfig = $state.get(stateName);
							$httpBackend.expectGET("transactions/views/index.html").respond(200);
						});

						it("should have a title", function() {
							stateConfig.data.title.should.equal("Payee Transactions");
						});

						it("should resolve to a URL", function() {
							$state.href(stateName, {id: 1}).should.equal("#/payees/1/transactions");
						});

						describe("(on transition)", function() {
							var resolvedContextModel,
									resolvedContext,
									resolvedTransactionBatch;

							beforeEach(function() {
								$state.go(stateName, {id: 1});
								$rootScope.$digest();
								$httpBackend.flush();
								resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
								resolvedContext = $injector.invoke($state.current.resolve.context, undefined, {contextModel: resolvedContextModel});
								resolvedContext.then(function(context) {
									resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, undefined, {contextModel: resolvedContextModel, context: context});
								});
							});

							it("should successfully transition", function() {
								$state.current.name.should.equal(stateName);
							});

							it("should resolve the parent context's model", function() {
								resolvedContextModel.should.equal(payeeModel);
							});

							it("should resolve the parent context", function() {
								payeeModel.find.should.have.been.calledWith(1);
								resolvedContext.should.eventually.deep.equal(payee);
							});

							it("should resolve the transaction batch", function() {
								transactionModel.all.should.have.been.calledWith("/payees/1", null, "prev", false);
								resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
							});

							describe("payee transaction state", function() {
								beforeEach(function() {
									stateName += ".transaction";
								});

								it("should resolve to a URL", function() {
									$state.href(stateName, {id: 1, transactionId: 2}).should.equal("#/payees/1/transactions/2");
								});

								it("should successfully transition", function() {
									$state.go(stateName);
									$rootScope.$digest();
									$state.current.name.should.equal(stateName);
								});
							});
						});
					});
				});
			});
		});

		describe("categories state", function() {
			beforeEach(function() {
				stateName = "root.categories";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("categories/views/index.html").respond(200);
			});
			
			it("should have a title", function() {
				stateConfig.data.title.should.equal("Categories");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName).should.equal("#/categories");
			});

			describe("(on transition)", function() {
				var resolvedCategories;

				beforeEach(function() {
					$state.go(stateName);
					$rootScope.$digest();
					$httpBackend.flush();
					resolvedCategories = $injector.invoke($state.current.resolve.categories);
				});
				
				it("should successfully transition", function() {
					$state.current.name.should.equal(stateName);
				});

				it("should resolve the categories", function() {
					categoryModel.allWithChildren.should.have.been.called;
					resolvedCategories.should.deep.equal(categories);
				});

				describe("category state", function() {
					beforeEach(function() {
						stateName += ".category";
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {id: 1}).should.equal("#/categories/1");
					});

					it("should successfully transition", function() {
						$state.go(stateName);
						$rootScope.$digest();
						$state.current.name.should.equal(stateName);
					});

					describe("category transactions state", function() {
						beforeEach(function() {
							stateName += ".transactions";
							stateConfig = $state.get(stateName);
							$httpBackend.expectGET("transactions/views/index.html").respond(200);
						});

						it("should have a title", function() {
							stateConfig.data.title.should.equal("Category Transactions");
						});

						it("should resolve to a URL", function() {
							$state.href(stateName, {id: 1}).should.equal("#/categories/1/transactions");
						});

						describe("(on transition)", function() {
							var resolvedContextModel,
									resolvedContext,
									resolvedTransactionBatch;

							beforeEach(function() {
								$state.go(stateName, {id: 1});
								$rootScope.$digest();
								$httpBackend.flush();
								resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
								resolvedContext = $injector.invoke($state.current.resolve.context, undefined, {contextModel: resolvedContextModel});
								resolvedContext.then(function(context) {
									resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, undefined, {contextModel: resolvedContextModel, context: context});
								});
							});

							it("should successfully transition", function() {
								$state.current.name.should.equal(stateName);
							});

							it("should resolve the parent context's model", function() {
								resolvedContextModel.should.equal(categoryModel);
							});

							it("should resolve the parent context", function() {
								categoryModel.find.should.have.been.calledWith(1);
								resolvedContext.should.eventually.deep.equal(category);
							});

							it("should resolve the transaction batch", function() {
								transactionModel.all.should.have.been.calledWith("/categories/1", null, "prev", false);
								resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
							});

							describe("category transaction state", function() {
								beforeEach(function() {
									stateName += ".transaction";
								});

								it("should resolve to a URL", function() {
									$state.href(stateName, {id: 1, transactionId: 2}).should.equal("#/categories/1/transactions/2");
								});

								it("should successfully transition", function() {
									$state.go(stateName);
									$rootScope.$digest();
									$state.current.name.should.equal(stateName);
								});
							});
						});
					});
				});
			});
		});

		describe("securities state", function() {
			beforeEach(function() {
				stateName = "root.securities";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("securities/views/index.html").respond(200);
			});
			
			it("should have a title", function() {
				stateConfig.data.title.should.equal("Securities");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName).should.equal("#/securities");
			});

			describe("(on transition)", function() {
				var resolvedSecurities;

				beforeEach(function() {
					$state.go(stateName);
					$rootScope.$digest();
					$httpBackend.flush();
					resolvedSecurities = $injector.invoke($state.current.resolve.securities);
				});
				
				it("should successfully transition", function() {
					$state.current.name.should.equal(stateName);
				});

				it("should resolve the securities", function() {
					securityModel.allWithBalances.should.have.been.called;
					resolvedSecurities.should.deep.equal(securities);
				});

				describe("security state", function() {
					beforeEach(function() {
						stateName += ".security";
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {id: 1}).should.equal("#/securities/1");
					});

					it("should successfully transition", function() {
						$state.go(stateName);
						$rootScope.$digest();
						$state.current.name.should.equal(stateName);
					});

					describe("security transactions state", function() {
						beforeEach(function() {
							stateName += ".transactions";
							stateConfig = $state.get(stateName);
							$httpBackend.expectGET("transactions/views/index.html").respond(200);
						});

						it("should have a title", function() {
							stateConfig.data.title.should.equal("Security Transactions");
						});

						it("should resolve to a URL", function() {
							$state.href(stateName, {id: 1}).should.equal("#/securities/1/transactions");
						});

						describe("(on transition)", function() {
							var resolvedContextModel,
									resolvedContext,
									resolvedTransactionBatch;

							beforeEach(function() {
								$state.go(stateName, {id: 1});
								$rootScope.$digest();
								$httpBackend.flush();
								resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
								resolvedContext = $injector.invoke($state.current.resolve.context, undefined, {contextModel: resolvedContextModel});
								resolvedContext.then(function(context) {
									resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, undefined, {contextModel: resolvedContextModel, context: context});
								});
							});

							it("should successfully transition", function() {
								$state.current.name.should.equal(stateName);
							});

							it("should resolve the parent context's model", function() {
								resolvedContextModel.should.equal(securityModel);
							});

							it("should resolve the parent context", function() {
								securityModel.find.should.have.been.calledWith(1);
								resolvedContext.should.eventually.deep.equal(security);
							});

							it("should resolve the transaction batch", function() {
								transactionModel.all.should.have.been.calledWith("/securities/1", null, "prev", false);
								resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
							});

							describe("security transaction state", function() {
								beforeEach(function() {
									stateName += ".transaction";
								});

								it("should resolve to a URL", function() {
									$state.href(stateName, {id: 1, transactionId: 2}).should.equal("#/securities/1/transactions/2");
								});

								it("should successfully transition", function() {
									$state.go(stateName);
									$rootScope.$digest();
									$state.current.name.should.equal(stateName);
								});
							});
						});
					});
				});
			});
		});

		describe("transactions state", function() {
			var query;

			beforeEach(function() {
				query = "search";
				stateName = "root.transactions";
				stateConfig = $state.get(stateName);
				$httpBackend.expectGET("transactions/views/index.html").respond(200);
			});

			it("should have a title", function() {
				stateConfig.data.title.should.equal("Search Transactions");
			});

			it("should resolve to a URL", function() {
				$state.href(stateName, {query: query}).should.equal("#/transactions?query=" + query);
			});

			describe("(on transition)", function() {
				var resolvedContext,
						resolvedTransactionBatch;

				beforeEach(function() {
					$state.go(stateName, {query: query});
					$rootScope.$digest();
					$httpBackend.flush();
					resolvedContext = $injector.invoke($state.current.resolve.context);
					resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, undefined, {context: resolvedContext});
				});

				it("should successfully transition", function() {
					$state.current.name.should.equal(stateName);
				});

				it("should resolve the context model", function() {
					(null === $injector.invoke($state.current.resolve.contextModel)).should.be.true;
				});

				it("should resolve the context", function() {
					resolvedContext.should.equal(query);
				});

				it("should resolve the transaction batch", function() {
					transactionModel.query.should.have.been.calledWith(query, null, "prev");
					resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
				});

				describe("transaction state", function() {
					beforeEach(function() {
						stateName += ".transaction";
					});

					it("should resolve to a URL", function() {
						$state.href(stateName, {query: query, transactionId: 2}).should.equal("#/transactions/2?query=" + query);
					});

					it("should successfully transition", function() {
						$state.go(stateName);
						$rootScope.$digest();
						$state.current.name.should.equal(stateName);
					});
				});
			});
		});
	});
})();
