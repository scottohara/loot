Rails.application.routes.draw do
	# Root
  root to: 'accounts#index'

	# Resource can be flagged
	concern :flaggable do
		resource :flag, only: [:update, :destroy]
	end

	# Resource can be split
	concern :splittable do
		resources :subtransactions, only: [:index]
	end

	# Resource has a status
	concern :reconcilable do
		resource :status, only: [:update, :destroy]
	end

	# Resource will default to last used values
	concern :defaultable do
		get 'last', on: :collection
	end

	# Resource can be favourited
	concern :favouritable do
		resource :favourite, only: [:update, :destroy]
	end

	resources :accounts, concerns: [:favouritable] do
		resources :transactions, only: [:index], concerns: [:reconcilable, :defaultable]
		put 'reconcile', on: :member
	end

	resources :payees, :categories, :securities, concerns: [:favouritable] do
		resources :transactions, only: [:index], concerns: [:defaultable]
	end

	resources :transactions, concerns: [:flaggable, :splittable]
	resources :schedules, except: [:show]
	resources :logins, only: [:create]

	get '*unmatched_route', to: 'application#routing_error'
end
