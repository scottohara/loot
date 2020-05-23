import { Entity } from "loot/types";
import { OgModalAlert } from "og-components/og-modal-alert/types";
import { OgModalConfirm } from "og-components/og-modal-confirm/types";
import { ScheduledTransaction } from "schedules/types";
import { SinonStub } from "sinon";
import { Transaction } from "transactions/types";

export interface CacheFactoryMock {
	info?: SinonStub;
	get?: SinonStub;
	(): angular.ICacheObject;
}

export type PromiseMockCallback<T> = (value?: PromiseMock<T> | T) => PromiseMock<T> | T;

export interface PromiseMock<T> {
	then(successCallback: PromiseMockCallback<T>, errorCallback: PromiseMockCallback<T>): PromiseMock<T> | T;
	catch(errorCallback: PromiseMockCallback<T>): PromiseMock<T> | T;
}

export interface DeferredMock<T> {
	promise: PromiseMock<T>;
	resolve(value?: T | null): void;
	reject(value?: T | {data: "unsuccessful";}): void;
}

export interface PromiseMockConfig<T> {
	args?: string | number | {
		id: number;
	};
	response?: T;
}

export interface QMock {
	defer<T>(): DeferredMock<T>;
	promisify<T, U>(success?: PromiseMockConfig<T> | string | number, error?: PromiseMockConfig<U> | string | number): SinonStub;
}

export interface StateMock {
	includes: SinonStub;
	params: {
		id?: string;
		transactionId?: string;
	};
	current?: {
		name: string;
	};
	currentState(state: string): void;
	reload(): void;
	go(): void;
}

export type UibModalMockResolve = Entity | ScheduledTransaction | angular.IPromise<ScheduledTransaction> | Transaction | angular.IPromise<Transaction> | OgModalAlert | OgModalConfirm | undefined;

export interface UibModalMockResolves {
	[key: string]: UibModalMockResolve;
}

export type UibModalMockCloseResult = Entity | ScheduledTransaction | Transaction | number | boolean | {data: ScheduledTransaction; skipped?: boolean;};

export type UibModalMockResultCallback = (value?: UibModalMockCloseResult) => UibModalMockCloseResult;

export interface UibModalMockResult {
	then(callback: UibModalMockResultCallback): UibModalMockResult;
	catch(callback: UibModalMockResultCallback): UibModalMockResult;
	finally(callback: UibModalMockResultCallback): UibModalMockResult;
}

export interface UibModalMock {
	resolves?: UibModalMockResolves;
	callbackResult?: UibModalMockCloseResult;
	closeCallback?: (value?: UibModalMockCloseResult) => UibModalMockCloseResult;
	catchCallback?: (value?: UibModalMockCloseResult) => UibModalMockCloseResult;
	finallyCallback?: (value?: UibModalMockCloseResult) => UibModalMockCloseResult;
	open(options: angular.ui.bootstrap.IModalSettings): {result: UibModalMockResult;};
	close(value?: UibModalMockCloseResult): void;
	dismiss(): void;
}

export interface UibModalInstanceMock {
	close: SinonStub;
	dismiss: SinonStub;
}

export interface WindowMock {
	localStorage: {
		getItem: SinonStub;
		removeItem: SinonStub;
		setItem: SinonStub;
	};
	sessionStorage: {
		getItem: SinonStub;
		removeItem: SinonStub;
		setItem: SinonStub;
	};
	btoa: SinonStub;
	navigator: {
		serviceWorker: {
			register: SinonStub;
		};
	};
	console: {
		log: SinonStub;
	};
}