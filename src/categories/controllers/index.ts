import "../css/index.less";
import type {
	OgTableActionHandlers,
	OgTableActions
} from "og-components/og-table-navigable/types";
import type { Category } from "categories/types";
import CategoryDeleteView from "categories/views/delete.html";
import CategoryEditView from "categories/views/edit.html";
import type CategoryModel from "categories/models/category";
import type { OgModalAlert } from "og-components/og-modal-alert/types";
import OgModalAlertView from "og-components/og-modal-alert/views/alert.html";
import type OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";

export default class CategoryIndexController {
	public readonly categories: Category[];

	public readonly tableActions: OgTableActions;

	private readonly showError: (message?: string) => void;

	public constructor($scope: angular.IScope,
						$transitions: angular.ui.IStateParamsService,
						private readonly $uibModal: angular.ui.bootstrap.IModalService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly $state: angular.ui.IStateService,
						private readonly categoryModel: CategoryModel,
						private readonly ogTableNavigableService: OgTableNavigableService,
						ogModalErrorService: OgModalErrorService,
						categories: Category[]) {
		const self: this = this;

		this.categories = angular.copy(categories).reduce((flattened: Category[], category: Category): Category[] => {
			const { children }: { children?: Category[]; } = category;

			delete category.children;

			return flattened.concat(category, undefined === children ? [] : children);
		}, []);

		this.tableActions = {
			selectAction(): void {
				$state.go(".transactions").catch(self.showError);
			},
			editAction(index: number): void {
				self.editCategory(index);
			},
			insertAction(): void {
				self.editCategory();
			},
			deleteAction(index: number): void {
				self.deleteCategory(index);
			},
			focusAction(index: number): void {
				$state.go(`${$state.includes("**.category") ? "^" : ""}.category`, { id: self.categories[index].id }).catch(self.showError);
			}
		};

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// If we have a category id, focus the specified row
		if (undefined !== $state.params.id) {
			this.focusCategory(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on("$destroy", $transitions.onSuccess({ to: "root.categories.category" }, (transition: angular.ui.IState): number => this.focusCategory(Number(transition.params("to").id))) as () => void);
	}

	public editCategory(index?: number): void {
		// Helper function to sort by direction, then by category name, then by subcategory name
		function byDirectionAndName(a: Category, b: Category): number {
			let x: string, y: string;

			if (a.direction === b.direction) {
				x = undefined === a.parent || null === a.parent ? a.name : `${a.parent.name}#${a.name}`;
				y = undefined === b.parent || null === b.parent ? b.name : `${b.parent.name}#${b.name}`;
			} else {
				x = a.direction;
				y = b.direction;
			}

			return x.localeCompare(y);
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: CategoryEditView,
			controller: "CategoryEditController",
			controllerAs: "vm",
			backdrop: "static",
			resolve: {
				category: (): Category | undefined => {
					let category: Category | undefined;

					// If we didn't get an index, we're adding a new category so just return null
					if (!isNaN(Number(index))) {
						category = this.categories[Number(index)];

						// Add the category to the LRU cache
						this.categoryModel.addRecent(category);
					}

					return category;
				}
			}
		}).result
			.then((category: Category): void => {
				let parentIndex: number;

				if (isNaN(Number(index))) {
					// Add new category to the end of the array
					this.categories.push(category);

					// Add the category to the LRU cache
					this.categoryModel.addRecent(category);

					// If the new category has a parent, increment the parent's children count
					if (null !== category.parent_id) {
						// Find the parent category by it's id
						parentIndex = this.categoryIndexById(category.parent_id);

						// If found, increment the number of children
						if (!isNaN(parentIndex)) {
							(this.categories[parentIndex].num_children as number)++;
						}
					}
				} else {
					// If the edited category parent has changed, increment/decrement the parent(s) children count
					if (category.parent_id !== this.categories[Number(index)].parent_id) {
						// Decrement the original parent (if required)
						if (null !== this.categories[Number(index)].parent_id) {
							parentIndex = this.categoryIndexById(this.categories[Number(index)].parent_id);
							if (!isNaN(parentIndex)) {
								(this.categories[parentIndex].num_children as number)--;
							}
						}

						// Increment the new parent (if required)
						if (null !== category.parent_id) {
							parentIndex = this.categoryIndexById(category.parent_id);
							if (!isNaN(parentIndex)) {
								(this.categories[parentIndex].num_children as number)++;
							}
						}
					}

					// Update the existing category in the array
					this.categories[Number(index)] = category;
				}

				// Resort the array
				this.categories.sort(byDirectionAndName);

				// Refocus the category
				this.focusCategory(Number(category.id));
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	public deleteCategory(index: number): void {
		// Check if the category can be deleted
		this.categoryModel.find(Number(this.categories[index].id)).then((category: Category): void => {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			let modalOptions: angular.ui.bootstrap.IModalSettings = {
				backdrop: "static"
			};

			// Check if the category has any transactions
			if (category.num_transactions > 0) {
				// Show an alert modal
				modalOptions = angular.extend({
					templateUrl: OgModalAlertView,
					controller: "OgModalAlertController",
					controllerAs: "vm",
					resolve: {
						alert: (): OgModalAlert => ({
							header: "Category has existing transactions",
							message: "You must first delete these transactions, or reassign to another category before attempting to delete this category."
						})
					}
				}, modalOptions) as angular.ui.bootstrap.IModalSettings;
			} else {
				// Show the delete category modal
				modalOptions = angular.extend({
					templateUrl: CategoryDeleteView,
					controller: "CategoryDeleteController",
					controllerAs: "vm",
					resolve: {
						category: (): Category => this.categories[index]
					}
				}, modalOptions) as angular.ui.bootstrap.IModalSettings;
			}

			// Show the modal
			this.$uibModal.open(modalOptions).result
				.then((): void => {
					// If the deleted category has a parent, decrement the parent's children count
					if (null !== this.categories[index].parent_id) {
						// Find the parent category by it's id
						const parentIndex = this.categoryIndexById(this.categories[index].parent_id);

						// If found, decrement the number of children
						if (!isNaN(parentIndex)) {
							(this.categories[parentIndex].num_children as number)--;
						}
					}

					// Remove the category (and any children) from the array
					this.categories.splice(index, 1 + (undefined === this.categories[index].num_children ? 0 : Number(this.categories[index].num_children)));

					// Go back to the parent state
					this.$state.go("root.categories").catch(this.showError);
				})
				.finally((): true => (this.ogTableNavigableService.enabled = true))
				.catch(this.showError);
		}).catch(this.showError);
	}

	public toggleFavourite(index: number): void {
		this.categoryModel.toggleFavourite(this.categories[index])
			.then((favourite: boolean): boolean => (this.categories[index].favourite = favourite))
			.catch(this.showError);
	}

	// Finds a specific category and focusses that row in the table
	private focusCategory(categoryIdToFocus: number | string): number {
		// Find the category by it's id
		const	targetIndex: number = this.categoryIndexById(categoryIdToFocus),
					delay = 50;

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout((): void => (this.tableActions as OgTableActionHandlers).focusRow(targetIndex), delay).catch(this.showError);
		}

		return targetIndex;
	}

	// Helper function to find a category by it's id and return it's index
	private categoryIndexById(id: number | string | null): number {
		let targetIndex = NaN;

		angular.forEach(this.categories, (category: Category, index: number): void => {
			if (isNaN(targetIndex) && category.id === id) {
				targetIndex = index;
			}
		});

		return targetIndex;
	}
}

CategoryIndexController.$inject = ["$scope", "$transitions", "$uibModal", "$timeout", "$state", "categoryModel", "ogTableNavigableService", "ogModalErrorService", "categories"];