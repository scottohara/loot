Loot::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'accounts#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'

	# Resource can be flagged
	concern :flaggable do
		resource :flag, :only => [:update, :destroy]
	end

	# Resource has a status
	concern :reconcilable do
		resource :status, :only => [:update, :destroy]
	end

	# Resource can be split
	concern :splittable do
		resources :subtransactions, :only => [:index]
	end

	# Resource will default to last used values
	concern :defaultable do
		get 'last', :on => :collection
	end

	resources :accounts, :except => [:new, :edit] do
		resources :transactions, :concerns => [:splittable, :reconcilable, :flaggable, :defaultable], :except => [:new, :edit]
		put 'reconcile', :on => :member
	end

	resources :payees, :categories, :securities, :except => [:new, :edit] do
		resources :transactions, :concerns => [:splittable, :flaggable, :defaultable], :except => [:new, :edit]
	end

	resources :schedules, :except => [:new, :edit, :show]
	resources :logins, :only => [:create]

	get '*unmatched_route', :to => 'application#routing_error'
end
