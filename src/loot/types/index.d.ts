import type AccountModel from "accounts/models/account";
import type CategoryModel from "categories/models/category";
import type PayeeModel from "payees/models/payee";
import type SecurityModel from "securities/models/security";

export interface Entity {
	id?: number;
	name: string;
	closing_balance: number;
}

export type NewOrExistingEntity = Entity | string | undefined;

export type EntityModel = AccountModel | CategoryModel | PayeeModel | SecurityModel;

export interface Cacheable<T> {
	readonly LRU_LOCAL_STORAGE_KEY: string;
	flush: (id?: number) => void;
	addRecent: (entity: T) => void;
	removeRecent: (id: number) => void;
}

export interface Favouritable<T> {
	toggleFavourite: (entity: T) => angular.IPromise<boolean>;
}

export interface Persistable<T> {
	type: string;
	path: (id?: number) => string;
	find: (id: number) => angular.IPromise<T>;
	save: (entity: T) => angular.IHttpPromise<T>;
	destroy: (entity: T) => angular.IPromise<void>;
}

export interface LootRootScope extends angular.IScope {
	$state: angular.ui.IStateService;
}