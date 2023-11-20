import type { Entity } from "~/loot/types";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type { OgModalConfirm } from "~/og-components/og-modal-confirm/types";
import type { ScheduledTransaction } from "~/schedules/types";
import type { SinonStub } from "sinon";
import type { Transaction } from "~/transactions/types";

export interface CacheFactoryMock {
	(): angular.ICacheObject;
	info?: SinonStub;
	get?: SinonStub;
}

export type PromiseMockCallback<T> = (
	value?: PromiseMock<T> | T,
) => PromiseMock<T> | T;
export type PromiseMockThen<T> = (
	successCallback: PromiseMockCallback<T>,
	errorCallback: PromiseMockCallback<T>,
) => PromiseMock<T> | T;

export interface PromiseMock<T> {
	then?: PromiseMockThen<T>;
	catch: (errorCallback: PromiseMockCallback<T>) => PromiseMock<T> | T;
}

export interface DeferredMock<T> {
	promise: PromiseMock<T>;
	resolve: (value?: T | null) => void;
	reject: (value?: T | { data: "unsuccessful" }) => void;
}

export interface PromiseMockConfig<T> {
	args?:
		| number
		| string
		| {
				id: number;
		  };
	response?: T;
}

export interface QMock {
	defer: <T>() => DeferredMock<T>;
	promisify: <T, U>(
		success?: PromiseMockConfig<T> | number | string,
		error?: PromiseMockConfig<U> | number | string,
	) => SinonStub;
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
	currentState: (state: string) => void;
	reload: () => void;
	go: () => void;
}

export type UibModalMockResolve =
	| angular.IPromise<ScheduledTransaction>
	| angular.IPromise<Transaction>
	| Entity
	| OgModalAlert
	| OgModalConfirm
	| ScheduledTransaction
	| Transaction
	| undefined;
export type UibModalMockResolves = Record<string, UibModalMockResolve>;
export type UibModalMockCloseResult =
	| Entity
	| ScheduledTransaction
	| Transaction
	| boolean
	| number
	| { data: ScheduledTransaction; skipped?: boolean };
export type UibModalMockResultCallback = (
	value?: UibModalMockCloseResult,
) => UibModalMockCloseResult;

export interface UibModalMockResult {
	then: (callback: UibModalMockResultCallback) => UibModalMockResult;
	catch: (callback: UibModalMockResultCallback) => UibModalMockResult;
	finally: (callback: UibModalMockResultCallback) => UibModalMockResult;
}

export interface UibModalMock {
	resolves?: UibModalMockResolves;
	callbackResult?: UibModalMockCloseResult;
	closeCallback?: (value?: UibModalMockCloseResult) => UibModalMockCloseResult;
	catchCallback?: (value?: UibModalMockCloseResult) => UibModalMockCloseResult;
	finallyCallback?: (
		value?: UibModalMockCloseResult,
	) => UibModalMockCloseResult;
	open: (options: angular.ui.bootstrap.IModalSettings) => {
		result: UibModalMockResult;
	};
	close: (value?: UibModalMockCloseResult) => void;
	dismiss: () => void;
}

export interface UibModalInstanceMock {
	close: SinonStub;
	dismiss: SinonStub;
}

export interface ServiceWorkerMock {
	register: SinonStub;
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
		serviceWorker?: ServiceWorkerMock;
	};
	console: {
		log: SinonStub;
	};
}
