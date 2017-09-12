describe("lootStatesProvider", () => {
	let	$rootScope,
			$state,
			$injector,
			$httpBackend,
			$uibModal,
			authenticationModel,
			accountModel,
			accountsWithBalances,
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
			queryService,
			stateName,
			stateParams,
			stateConfig;

	// Load the modules
	beforeEach(module("lootStates", "lootMocks", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "authenticationModel", "authenticated", "accountModel", "accountsWithBalances", "account", "scheduleModel", "schedules", "payeeModel", "payees", "payee", "categoryModel", "categories", "category", "securityModel", "securities", "security", "transactionModel", "transactionBatch"])));

	// Inject the object under test and it's dependencies
	beforeEach(inject((_lootStates_, _$rootScope_, _$state_, _$injector_, _$httpBackend_, _$uibModal_, _authenticationModel_, _accountModel_, _accountsWithBalances_, _account_, _scheduleModel_, _schedules_, _payeeModel_, _payees_, _payee_, _categoryModel_, _categories_, _category_, _securityModel_, _securities_, _security_, _transactionModel_, _transactionBatch_, _queryService_) => {
		$rootScope = _$rootScope_;
		$state = _$state_;
		$injector = _$injector_;
		$httpBackend = _$httpBackend_;
		$uibModal = _$uibModal_;
		authenticationModel = _authenticationModel_;
		accountModel = _accountModel_;
		accountsWithBalances = _accountsWithBalances_;
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
		queryService = _queryService_;
		$httpBackend.expectGET("loot/views/layout.html").respond(200);
	}));

	describe("root state", () => {
		let resolvedAuthenticated;

		beforeEach(() => {
			stateName = "root";
			stateConfig = $state.get(stateName);
		});

		it("should be abstract", () => stateConfig.abstract.should.be.true);

		it("should have a title", () => stateConfig.data.title.should.equal("Welcome"));

		it("should resolve the authentication status of a logged in user", () => {
			resolvedAuthenticated = $injector.invoke(stateConfig.resolve.authenticated);
			resolvedAuthenticated.should.be.true;
		});

		describe("(non-logged in user)", () => {
			beforeEach(() => {
				authenticationModel.isAuthenticated = false;
				resolvedAuthenticated = $injector.invoke(stateConfig.resolve.authenticated);
			});

			it("should show the login modal", () => $uibModal.open.should.have.been.called);

			it("should resolve the authentication status of a logged in user when the login modal is closed", () => {
				authenticationModel.isAuthenticated = true;
				$uibModal.close();
				resolvedAuthenticated.should.eventually.be.true;
			});

			it("should resolve the authentication status of a non-logged in user when the login modal is dismissed", () => {
				$uibModal.dismiss();
				resolvedAuthenticated.should.eventually.be.false;
			});
		});
	});

	describe("accounts state", () => {
		beforeEach(() => {
			stateName = "root.accounts";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("accounts/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Accounts"));

		it("should resolve to a URL", () => $state.href(stateName).should.equal("#!/accounts"));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let resolvedAccounts;

			beforeEach(() => {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedAccounts = $injector.invoke($state.current.resolve.accounts);
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the accounts", () => {
				accountModel.allWithBalances.should.have.been.called;
				resolvedAccounts.should.eventually.deep.equal(accountsWithBalances);
			});

			describe("account state", () => {
				beforeEach(() => {
					stateName += ".account";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/accounts/1"));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});

				describe("account transactions state", () => {
					beforeEach(() => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", () => stateConfig.data.title.should.equal("Account Transactions"));

					it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/accounts/1/transactions"));

					it("should not transition if the user is unauthenticated", () => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams);
						$rootScope.$digest();
						$state.current.name.should.not.equal(stateName);
					});

					describe("(on transition)", () => {
						let	resolvedContextModel,
								resolvedContext,
								resolvedTransactionBatch;

						beforeEach(() => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							$httpBackend.flush();
							resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
							$injector.invoke($state.current.resolve.context, null, {contextModel: resolvedContextModel}).then(context => (resolvedContext = context));
							resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, null, {contextModel: resolvedContextModel, context: resolvedContext});
						});

						it("should successfully transition", () => $state.current.name.should.equal(stateName));

						it("should resolve the parent context's model", () => resolvedContextModel.should.equal(accountModel));

						it("should resolve the parent context", () => {
							accountModel.find.should.have.been.calledWith("1");
							resolvedContext.should.deep.equal(account);
						});

						it("should resolve the transaction batch", () => {
							resolvedContextModel.isUnreconciledOnly.should.have.been.calledWith(resolvedContext.id);
							transactionModel.all.should.have.been.calledWith("/accounts/1", null, "prev", true);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("account transaction state", () => {
							beforeEach(() => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/accounts/1/transactions/2"));

							it("should successfully transition", () => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								$state.current.name.should.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("schedules state", () => {
		beforeEach(() => {
			stateName = "root.schedules";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("schedules/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Schedules"));

		it("should resolve to a URL", () => $state.href(stateName).should.equal("#!/schedules"));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let resolvedSchedules;

			beforeEach(() => {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedSchedules = $injector.invoke($state.current.resolve.schedules);
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the schedules", () => {
				scheduleModel.all.should.have.been.called;
				resolvedSchedules.should.deep.equal(schedules);
			});

			describe("schedule state", () => {
				beforeEach(() => {
					stateName += ".schedule";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/schedules/1"));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});
			});
		});
	});

	describe("payees state", () => {
		beforeEach(() => {
			stateName = "root.payees";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("payees/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Payees"));

		it("should resolve to a URL", () => $state.href(stateName).should.equal("#!/payees"));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let resolvedPayees;

			beforeEach(() => {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedPayees = $injector.invoke($state.current.resolve.payees);
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the payees", () => {
				payeeModel.allList.should.have.been.called;
				resolvedPayees.should.eventually.deep.equal(payees);
			});

			describe("payee state", () => {
				beforeEach(() => {
					stateName += ".payee";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/payees/1"));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});

				describe("payee transactions state", () => {
					beforeEach(() => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", () => stateConfig.data.title.should.equal("Payee Transactions"));

					it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/payees/1/transactions"));

					it("should not transition if the user is unauthenticated", () => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams);
						$rootScope.$digest();
						$state.current.name.should.not.equal(stateName);
					});

					describe("(on transition)", () => {
						let	resolvedContextModel,
								resolvedContext,
								resolvedTransactionBatch;

						beforeEach(() => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							$httpBackend.flush();
							resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
							resolvedContext = $injector.invoke($state.current.resolve.context, null, {contextModel: resolvedContextModel});
							resolvedContext.then(context => (resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", () => $state.current.name.should.equal(stateName));

						it("should resolve the parent context's model", () => resolvedContextModel.should.equal(payeeModel));

						it("should resolve the parent context", () => {
							payeeModel.find.should.have.been.calledWith("1");
							resolvedContext.should.eventually.deep.equal(payee);
						});

						it("should resolve the transaction batch", () => {
							transactionModel.all.should.have.been.calledWith("/payees/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("payee transaction state", () => {
							beforeEach(() => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/payees/1/transactions/2"));

							it("should successfully transition", () => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								$state.current.name.should.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("categories state", () => {
		beforeEach(() => {
			stateName = "root.categories";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("categories/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Categories"));

		it("should resolve to a URL", () => $state.href(stateName).should.equal("#!/categories"));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let resolvedCategories;

			beforeEach(() => {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedCategories = $injector.invoke($state.current.resolve.categories);
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the categories", () => {
				categoryModel.allWithChildren.should.have.been.called;
				resolvedCategories.should.deep.equal(categories);
			});

			describe("category state", () => {
				beforeEach(() => {
					stateName += ".category";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/categories/1"));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});

				describe("category transactions state", () => {
					beforeEach(() => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", () => stateConfig.data.title.should.equal("Category Transactions"));

					it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/categories/1/transactions"));

					it("should not transition if the user is unauthenticated", () => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams);
						$rootScope.$digest();
						$state.current.name.should.not.equal(stateName);
					});

					describe("(on transition)", () => {
						let	resolvedContextModel,
								resolvedContext,
								resolvedTransactionBatch;

						beforeEach(() => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							$httpBackend.flush();
							resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
							resolvedContext = $injector.invoke($state.current.resolve.context, null, {contextModel: resolvedContextModel});
							resolvedContext.then(context => (resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", () => $state.current.name.should.equal(stateName));

						it("should resolve the parent context's model", () => resolvedContextModel.should.equal(categoryModel));

						it("should resolve the parent context", () => {
							categoryModel.find.should.have.been.calledWith("1");
							resolvedContext.should.eventually.deep.equal(category);
						});

						it("should resolve the transaction batch", () => {
							transactionModel.all.should.have.been.calledWith("/categories/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("category transaction state", () => {
							beforeEach(() => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/categories/1/transactions/2"));

							it("should successfully transition", () => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								$state.current.name.should.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("securities state", () => {
		beforeEach(() => {
			stateName = "root.securities";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("securities/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Securities"));

		it("should resolve to a URL", () => $state.href(stateName).should.equal("#!/securities"));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let resolvedSecurities;

			beforeEach(() => {
				$state.go(stateName);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedSecurities = $injector.invoke($state.current.resolve.securities);
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the securities", () => {
				securityModel.allWithBalances.should.have.been.called;
				resolvedSecurities.should.deep.equal(securities);
			});

			describe("security state", () => {
				beforeEach(() => {
					stateName += ".security";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/securities/1"));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});

				describe("security transactions state", () => {
					beforeEach(() => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", () => stateConfig.data.title.should.equal("Security Transactions"));

					it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/securities/1/transactions"));

					it("should not transition if the user is unauthenticated", () => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams);
						$rootScope.$digest();
						$state.current.name.should.not.equal(stateName);
					});

					describe("(on transition)", () => {
						let	resolvedContextModel,
								resolvedContext,
								resolvedTransactionBatch;

						beforeEach(() => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							$httpBackend.flush();
							resolvedContextModel = $injector.invoke($state.current.resolve.contextModel);
							resolvedContext = $injector.invoke($state.current.resolve.context, null, {contextModel: resolvedContextModel});
							resolvedContext.then(context => (resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", () => $state.current.name.should.equal(stateName));

						it("should resolve the parent context's model", () => resolvedContextModel.should.equal(securityModel));

						it("should resolve the parent context", () => {
							securityModel.find.should.have.been.calledWith("1");
							resolvedContext.should.eventually.deep.equal(security);
						});

						it("should resolve the transaction batch", () => {
							transactionModel.all.should.have.been.calledWith("/securities/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("security transaction state", () => {
							beforeEach(() => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal("#!/securities/1/transactions/2"));

							it("should successfully transition", () => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								$state.current.name.should.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("transactions state", () => {
		let query;

		beforeEach(() => {
			query = "search";
			stateName = "root.transactions";
			stateParams = {query};
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("transactions/views/index.html").respond(200);
		});

		it("should have a title", () => stateConfig.data.title.should.equal("Search Transactions"));

		it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal(`#!/transactions?query=${query}`));

		it("should not transition if the user is unauthenticated", () => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName, stateParams);
			$rootScope.$digest();
			$state.current.name.should.not.equal(stateName);
		});

		describe("(on transition)", () => {
			let	previousState,
					resolvedPreviousState,
					resolvedContext,
					resolvedTransactionBatch;

			beforeEach(() => {
				previousState = {
					current: {
						name: "previous state"
					},
					params: {key: "value"},
					includes: sinon.stub().returns(false)
				};
				$state.go(stateName, stateParams);
				$rootScope.$digest();
				$httpBackend.flush();
				resolvedPreviousState = $injector.invoke($state.current.resolve.previousState, null, {$state: previousState});
				resolvedContext = $injector.invoke($state.current.resolve.context);
				resolvedTransactionBatch = $injector.invoke($state.current.resolve.transactionBatch, null, {context: resolvedContext});
				$injector.invoke($state.current.onEnter, null, {previousState: resolvedPreviousState});
			});

			it("should successfully transition", () => $state.current.name.should.equal(stateName));

			it("should resolve the previous state", () => resolvedPreviousState.should.deep.equal({name: previousState.current.name, params: previousState.params}));

			it("should not resolve the previous state if transitioning from a different query", () => {
				previousState.includes.withArgs("root.transactions").returns(true);
				resolvedPreviousState = $injector.invoke($state.current.resolve.previousState, null, {$state: previousState});
				(!resolvedPreviousState).should.be.true;
			});

			it("should resolve the context model", () => (null === $injector.invoke($state.current.resolve.contextModel)).should.be.true);

			it("should resolve the context", () => resolvedContext.should.equal(query));

			it("should resolve the transaction batch", () => {
				transactionModel.query.should.have.been.calledWith(query, null, "prev");
				resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
			});

			it("should set the previous state property on the query service on enter", () => queryService.previousState.should.deep.equal(resolvedPreviousState));

			it("should not update the previous state property on the query service on enter if the previous state did not resolve", () => {
				$injector.invoke($state.current.onEnter, null, {previousState: null});
				queryService.previousState.should.deep.equal(resolvedPreviousState);
			});

			it("should set the query property on the query service on enter", () => queryService.query.should.equal(query));

			it("should clear the query property on the query service on exit", () => {
				$httpBackend.expectGET("accounts/views/index.html").respond(200);
				$state.go("root.accounts");
				$rootScope.$digest();
				$httpBackend.flush();
				(!queryService.query).should.be.true;
			});

			describe("transaction state", () => {
				beforeEach(() => {
					stateName += ".transaction";
					stateParams.transactionId = 2;
				});

				it("should resolve to a URL", () => $state.href(stateName, stateParams).should.equal(`#!/transactions/2?query=${query}`));

				it("should successfully transition", () => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					$state.current.name.should.equal(stateName);
				});
			});
		});
	});
});
