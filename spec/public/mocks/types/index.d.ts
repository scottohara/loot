import {
	Account,
	Accounts
} from "accounts/types";
import {
	Entity,
	EntityModel
} from "loot/types";
import {
	Transaction,
	TransactionBatch
} from "transactions/types";
import {SinonStub} from "sinon";
import {StateMock} from "mocks/node-modules/angular/types";

export interface Mock<T> {
	$get(): T;
}

export interface ControllerTestLocals {
	[key: string]: angular.IScope | Accounts | Account | StateMock | Transaction | TransactionBatch | EntityModel | Entity | string | null | undefined;
	$scope?: angular.IScope;
}

export type ControllerTestFactory = (controller: string, locals?: ControllerTestLocals, bindings?: {}) => angular.IController;

export interface DirectiveTestModel {
	context?: boolean;
	type?: string;
	account?: Account;
	transaction?: Transaction;
}

export interface DirectiveTestScope extends angular.IScope {
	model?: DirectiveTestModel | string | number | boolean | null;
}

interface EventMock {
	altKey?: boolean;
	bubbles?: boolean;
	cancelable?: boolean;
	cancelBubble?: boolean;
	ctrlKey?: boolean;
	currentTarget?: Element;
	defaultPrevented?: boolean;
	detail?: number;
	eventPhase?: number;
	isTrusted?: boolean;
	metaKey?: boolean;
	returnValue?: boolean;
	scoped?: boolean;
	shiftKey?: boolean;
	srcElement?: Element | null;
	target?: Element;
	timeStamp?: number;
	type?: string;
	view?: Window;
	AT_TARGET?: number;
	BUBBLING_PHASE?: number;
	CAPTURING_PHASE?: number;
	deepPath?(): EventTarget[];
	initEvent?(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
	initUIEvent?(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, viewArg: Window, detailArg: number): void;
	preventDefault?(): void;
	stopImmediatePropagation?(): void;
	stopPropagation?(): void;
}

export interface KeyboardEventMock extends EventMock {
	char?: string | null;
	charCode?: number;
	code?: string;
	key?: string;
	keyCode: number;
	locale?: string;
	location?: number;
	repeat?: boolean;
	which?: number;
	DOM_KEY_LOCATION_JOYSTICK?: number;
	DOM_KEY_LOCATION_LEFT?: number;
	DOM_KEY_LOCATION_MOBILE?: number;
	DOM_KEY_LOCATION_NUMPAD?: number;
	DOM_KEY_LOCATION_RIGHT?: number;
	DOM_KEY_LOCATION_STANDARD?: number;
	getModifierState?(keyArg: string): boolean;
	initKeyboardEvent?(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, viewArg: Window, keyArg: string, locationArg: number, modifiersListArg: string, repeat: boolean, locale: string): void;
}

interface JQueryEventMock extends EventMock {
	delegateTarget?: Element;
	data?: undefined;
	namespace?: string;
	originalEvent?: Event;
	relatedTarget?: Element;
	result?: undefined;
	pageX?: number;
	pageY?: number;
	isDefaultPrevented?(): boolean;
	isImmediatePropagationStopped?(): boolean;
	isPropagationStopped?(): boolean;
}

export interface JQueryKeyEventObjectMock extends KeyboardEventMock, JQueryEventMock {
}

export interface JQueryMouseEventObjectMock extends JQueryEventMock {
	button?: number;
	clientX?: number;
	clientY?: number;
	offsetX?: number;
	offsetY?: number;
	screenX?: number;
	screenY?: number;
	which?: number;
}