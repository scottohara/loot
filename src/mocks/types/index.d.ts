import type { Account, Accounts } from "~/accounts/types";
import type { Entity, EntityModel } from "~/loot/types";
import type { Transaction, TransactionBatch } from "~/transactions/types";
import type { StateMock } from "~/mocks/node-modules/angular/types";

export interface Mock<T> {
	$get: () => T;
}

export interface ControllerTestLocals {
	[key: string]:
		| Account
		| Accounts
		| angular.IScope
		| Entity
		| EntityModel
		| StateMock
		| Transaction
		| TransactionBatch
		| string
		| null
		| undefined;
	$scope?: angular.IScope;
}

export type ControllerTestFactory = (
	controller: string,
	locals?: ControllerTestLocals,
	bindings?: Record<string, unknown>,
) => angular.IController;

export interface DirectiveTestModel {
	context?: boolean;
	type?: string;
	account?: Account;
	transaction?: Transaction;
}

export interface DirectiveTestScope extends angular.IScope {
	model?: DirectiveTestModel | Transaction | boolean | number | string | null;
}

interface EventMock {
	altKey?: boolean;
	bubbles?: boolean;
	cancelable?: boolean;
	cancelBubble?: boolean;
	composed?: boolean;
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
	readonly AT_TARGET?: number;
	readonly BUBBLING_PHASE?: number;
	readonly CAPTURING_PHASE?: number;
	readonly NONE?: number;
	composedPath?: () => EventTarget[];
	deepPath?: () => EventTarget[];
	initEvent?: (
		eventTypeArg: string,
		canBubbleArg: boolean,
		cancelableArg: boolean,
	) => void;
	initUIEvent?: (
		typeArg: string,
		canBubbleArg: boolean,
		cancelableArg: boolean,
		viewArg: Window,
		detailArg: number,
	) => void;
	preventDefault?: () => void;
	stopImmediatePropagation?: () => void;
	stopPropagation?: () => void;
}

export interface KeyboardEventMock extends EventMock {
	char?: string | null;
	charCode?: number;
	code?: string;
	isComposing?: boolean;
	key?: string;
	keyCode?: number;
	locale?: string;
	location?: number;
	repeat?: boolean;
	which?: number;
	readonly DOM_KEY_LOCATION_JOYSTICK?: number;
	readonly DOM_KEY_LOCATION_LEFT?: number;
	readonly DOM_KEY_LOCATION_MOBILE?: number;
	readonly DOM_KEY_LOCATION_NUMPAD?: number;
	readonly DOM_KEY_LOCATION_RIGHT?: number;
	readonly DOM_KEY_LOCATION_STANDARD?: number;
	getModifierState?: (keyArg: string) => boolean;
	initKeyboardEvent?: (
		typeArg: string,
		canBubbleArg: boolean,
		cancelableArg: boolean,
		viewArg: Window,
		keyArg: string,
		locationArg: number,
		modifiersListArg: string,
		repeat: boolean,
		locale: string,
	) => void;
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
	isDefaultPrevented?: () => boolean;
	isImmediatePropagationStopped?: () => boolean;
	isPropagationStopped?: () => boolean;
}

export interface JQueryKeyEventObjectMock
	extends KeyboardEventMock,
		JQueryEventMock {}

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
