# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'models/concerns/transactable'
require 'rails_helper'

::RSpec.describe ::Category do
	context 'category' do
		it_behaves_like ::Transactable do
			let(:context_factory) { :category_with_children }
			let(:ledger_json_key) { :category }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2} }
		end
	end

	context 'subcategory' do
		it_behaves_like ::Transactable do
			let(:context_factory) { :subcategory }
			let(:ledger_json_key) { :subcategory }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2} }
		end
	end

	describe '::find_or_new' do
		context 'existing category' do
			let(:category) { create :category }

			it 'should return the existing category' do
				expect(described_class.find_or_new 'id' => category.id).to eq category
			end
		end

		context 'new category' do
			let(:category_name) { 'New category' }

			it 'should return a newly created category' do
				category = described_class.find_or_new category_name
				expect(category.name).to eq category_name
				expect(category.direction).to eq 'outflow'
				expect(category.parent).to be_nil
			end

			context 'with parent' do
				let(:parent) { create :inflow_category }

				it 'should return a newly created category' do
					category = described_class.find_or_new category_name, parent
					expect(category.name).to eq category_name
					expect(category.direction).to eq 'inflow'
					expect(category.parent).to eq parent
				end
			end
		end
	end

	describe '#opening_balance' do
		subject(:category) { create :category }

		it 'should return zero' do
			expect(category.opening_balance).to eq 0
		end
	end

	describe '#account_type' do
		subject(:category) { create :category }

		it 'should return nil' do
			expect(category.account_type).to be_nil
		end
	end

	describe '#as_json' do
		context 'with no options' do
			context 'category' do
				subject(:category) { create :category, name: 'Test Category', children: 1, transactions: 1 }

				let(:json) { category.as_json }

				it 'should include only the default fields' do
					expect(json).to eq(id: category.id, name: category.name, direction: 'outflow', favourite: false, parent_id: nil)
				end
			end

			context 'subcategory' do
				subject(:category) { create :subcategory, name: 'Test Category', transactions: 1 }

				let(:json) { category.as_json }

				it 'should include only the default fields' do
					expect(json).to eq(id: category.id, name: category.name, direction: 'outflow', favourite: false, parent_id: category.parent_id)
				end
			end
		end

		context 'with options' do
			context 'closing_balance' do
				subject(:category) { create :category, name: 'Test Category', transactions: 1 }

				let(:json) { category.as_json only: %i[id closing_balance] }

				it 'should include closing_balance' do
					expect(json).to eq(id: category.id, closing_balance: category.closing_balance)
				end
			end

			context 'num_transactions' do
				subject(:category) { create :category, name: 'Test Category', transactions: 1 }

				let(:json) { category.as_json only: %i[name num_transactions] }

				it 'should include num_transactions' do
					expect(json).to eq(name: category.name, num_transactions: 1)
				end
			end

			context 'num_children' do
				subject(:category) { create :category, name: 'Test Category', children: 1 }

				let(:json) { category.as_json only: %i[id num_children] }

				it 'should include num_children' do
					expect(json).to eq(id: category.id, num_children: 1)
				end
			end

			context 'parent on a subcategory' do
				subject(:category) { create :subcategory, name: 'Test Category' }

				let(:json) { category.as_json only: %i[parent] }

				it 'should include the parent with id, name and direction only' do
					expect(json[:parent]).to eq(id: category.parent.id, name: category.parent.name, direction: 'outflow')
				end
			end

			context 'parent on a top-level category' do
				subject(:category) { create :category, name: 'Test Category' }

				let(:json) { category.as_json only: %i[parent] }

				it 'should include parent as nil' do
					expect(json).to eq(parent: nil)
				end
			end

			context 'children' do
				context 'on a category with loaded children' do
					subject(:category) { create :category, name: 'Test Category', children: 1 }

					let :json do
						category.children.load
						category.as_json only: %i[children]
					end

					it 'should include each child shaped with the nested fields' do
						expect(json[:children].first).to include id: category.children.first.id
						expect(json[:children].first).to include name: category.children.first.name
						expect(json[:children].first).to include direction: 'outflow'
						expect(json[:children].first).to include parent_id: category.id
						expect(json[:children].first).to include num_transactions: 0
						expect(json[:children].first).to include favourite: false
						expect(json[:children].first[:parent]).to eq(id: category.id, name: category.name, direction: category.direction)
						expect(json[:children].first).not_to include :children
					end
				end

				context 'on a subcategory' do
					subject(:category) { create :subcategory, name: 'Test Category' }

					let(:json) { category.as_json only: %i[children] }

					it 'should not include children' do
						expect(json).not_to include :children
					end
				end

				context 'on a category with unloaded children' do
					subject(:category) { create :category, name: 'Test Category', children: 1 }

					let(:json) { category.as_json only: %i[children] }

					it 'should not include children' do
						expect(category.children.loaded?).to be false
						expect(json).not_to include :children
					end
				end
			end
		end
	end
end
