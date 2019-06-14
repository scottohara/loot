import "../css/index.less";
import {
	IModalService,
	IModalSettings
} from "angular-ui-bootstrap";
import {
	OgTableActionHandlers,
	OgTableActions
} from "og-components/og-table-navigable/types";
import {Category} from "categories/types";
import CategoryDeleteView from "categories/views/delete.html";
import CategoryEditView from "categories/views/edit.html";
import CategoryModel from "categories/models/category";
import {OgModalAlert} from "og-components/og-modal-alert/types";
import OgModalAlertView from "og-components/og-modal-alert/views/alert.html";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";

export default class CategoryIndexController {
	public readonly categories: Category[];

	public readonly tableActions: OgTableActions;

	public constructor($scope: angular.IScope, $transitions: angular.ui.IStateParamsService,
						private readonly $uibModal: IModalService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly $state: angular.ui.IStateService,
						private readonly categoryModel: CategoryModel,
						private readonly ogTableNavigableService: OgTableNavigableService, categories: Category[]) {
		const self: this = this;

		this.categories = angular.copy(categories).reduce((flattened: Category[], category: Category): Category[] => {
			const {children}: {children?: Category[];} = category;

			delete category.children;

			return flattened.concat(category, children || []);
		}, []);
		this.tableActions = {
			selectAction(): void {
				$state.go(".transactions");
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
				$state.go(`${$state.includes("**.category") ? "^" : ""}.category`, {id: self.categories[index].id});
			}
		};

		// If we have a category id, focus the specified row
		if (Number($state.params.id)) {
			this.focusCategory(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on("$destroy", $transitions.onSuccess({to: "root.categories.category"}, (transition: angular.ui.IState): number => this.focusCategory(Number(transition.params("to").id))));
	}

	public editCategory(index?: number): void {
		// Helper function to sort by direction, then by category name, then by subcategory name
		function byDirectionAndName(a: Category, b: Category): number {
			let x: string, y: string;

			if (a.direction === b.direction) {
				x = a.parent ? `${a.parent.name}#${a.name}` : a.name;
				y = b.parent ? `${b.parent.name}#${b.name}` : b.name;
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
				category: (): Category | null => {
					let category: Category | null = null;

					// If we didn't get an index, we're adding a new category so just return null
					if (!isNaN(Number(index))) {
						category = this.categories[Number(index)];

						// Add the category to the LRU cache
						this.categoryModel.addRecent(category);
					}

					return category;
				}
			}
		}).result.then((category: Category): void => {
			let parentIndex: number;

			if (isNaN(Number(index))) {
				// Add new category to the end of the array
				this.categories.push(category);

				// Add the category to the LRU cache
				this.categoryModel.addRecent(category);

				// If the new category has a parent, increment the parent's children count
				if (!isNaN(Number(category.parent_id))) {
					// Find the parent category by it's id
					parentIndex = this.categoryIndexById(category.parent_id);

					// If found, increment the number of children
					if (!isNaN(parentIndex)) {
						this.categories[parentIndex].num_children++;
					}
				}
			} else {
				// If the edited category parent has changed, increment/decrement the parent(s) children count
				if (category.parent_id !== this.categories[Number(index)].parent_id) {
					// Decrement the original parent (if required)
					if (!isNaN(Number(this.categories[Number(index)].parent_id))) {
						parentIndex = this.categoryIndexById(this.categories[Number(index)].parent_id);
						if (!isNaN(parentIndex)) {
							this.categories[parentIndex].num_children--;
						}
					}

					// Increment the new parent (if required)
					if (!isNaN(Number(category.parent_id))) {
						parentIndex = this.categoryIndexById(category.parent_id);
						if (!isNaN(parentIndex)) {
							this.categories[parentIndex].num_children++;
						}
					}
				}

				// Update the existing category in the array
				this.categories[Number(index)] = category;
			}

			// Resort the array
			this.categories.sort(byDirectionAndName);

			// Refocus the category
			this.focusCategory(category.id);
		}).finally((): true => (this.ogTableNavigableService.enabled = true));
	}

	public deleteCategory(index: number): void {
		// Check if the category can be deleted
		this.categoryModel.find(this.categories[index].id).then((category: Category): void => {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			let modalOptions: IModalSettings = {
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
				}, modalOptions);
			} else {
				// Show the delete category modal
				modalOptions = angular.extend({
					templateUrl: CategoryDeleteView,
					controller: "CategoryDeleteController",
					controllerAs: "vm",
					resolve: {
						category: (): Category => this.categories[index]
					}
				}, modalOptions);
			}

			// Show the modal
			this.$uibModal.open(modalOptions).result.then((): void => {
				// If the deleted category has a parent, decrement the parent's children count
				if (!isNaN(Number(this.categories[index].parent_id))) {
					// Find the parent category by it's id
					const parentIndex = this.categoryIndexById(this.categories[index].parent_id);

					// If found, decrement the number of children
					if (!isNaN(parentIndex)) {
						this.categories[parentIndex].num_children--;
					}
				}

				// Remove the category (and any children) from the array
				this.categories.splice(index, 1 + (this.categories[index].num_children || 0));

				// Go back to the parent state
				this.$state.go("root.categories");
			}).finally((): true => (this.ogTableNavigableService.enabled = true));
		});
	}

	public toggleFavourite(index: number): void {
		this.categoryModel.toggleFavourite(this.categories[index]).then((favourite: boolean): boolean => (this.categories[index].favourite = favourite));
	}

	// Finds a specific category and focusses that row in the table
	private focusCategory(categoryIdToFocus: string | number): number {
		// Find the category by it's id
		const	targetIndex: number = this.categoryIndexById(categoryIdToFocus),
					delay = 50;

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout((): void => (this.tableActions as OgTableActionHandlers).focusRow(targetIndex), delay);
		}

		return targetIndex;
	}

	// Helper function to find a category by it's id and return it's index
	private categoryIndexById(id: string | number | null): number {
		let targetIndex = NaN;

		angular.forEach(this.categories, (category: Category, index: number): void => {
			if (isNaN(targetIndex) && category.id === id) {
				targetIndex = index;
			}
		});

		return targetIndex;
	}
}

CategoryIndexController.$inject = ["$scope", "$transitions", "$uibModal", "$timeout", "$state", "categoryModel", "ogTableNavigableService", "categories"];