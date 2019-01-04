# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'rails_helper'
require 'models/concerns/transactable'

RSpec.describe Category, type: :model do
	context 'category' do
		it_behaves_like Transactable do
			let(:context_factory) { :category_with_children }
			let(:ledger_json_key) { :category }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2} }
		end
	end

	context 'subcategory' do
		it_behaves_like Transactable do
			let(:context_factory) { :subcategory }
			let(:ledger_json_key) { :subcategory }
			let(:expected_closing_balances) { {with_date: -1, without_date: -2} }
		end
	end

	describe '::find_or_new' do
		context 'existing category' do
			let(:category) { create :category }

			it 'should return the existing category' do
				expect(Category.find_or_new 'id' => category.id).to eq category
			end
		end

		context 'new category' do
			let(:category_name) { 'New category' }

			it 'should return a newly created category' do
				category = Category.find_or_new category_name
				expect(category.name).to eq category_name
				expect(category.direction).to eq 'outflow'
				expect(category.parent).to be_nil
			end

			context 'with parent' do
				let(:parent) { create :inflow_category }

				it 'should return a newly created category' do
					category = Category.find_or_new category_name, parent
					expect(category.name).to eq category_name
					expect(category.direction).to eq 'inflow'
					expect(category.parent).to eq parent
				end
			end
		end
	end

	describe '#opening_balance' do
		subject { create :category }

		it 'should return zero' do
			expect(subject.opening_balance).to eq 0
		end
	end

	describe '#account_type' do
		subject { create :category }

		it 'should return nil' do
			expect(subject.account_type).to be_nil
		end
	end

	describe '#as_json' do
		context 'with default options' do
			let(:json) { subject.as_json }

			before :each do
				expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(subject, fields: %i[id name direction parent_id favourite]).and_call_original
			end

			context 'category' do
				subject { create :category, name: 'Test Category', children: 1, transactions: 1 }

				it 'should return a JSON representation excluding children' do
					expect(json).to include parent_id: nil
				end
			end

			context 'subcategory' do
				subject { create :subcategory, name: 'Test Category', transactions: 1 }

				it 'should return a JSON representation excluding parent' do
					expect(json).to include parent_id: subject.parent.id
				end
			end

			after :each do
				expect(json).not_to include :num_children
				expect(json).not_to include :parent
				expect(json).not_to include :closing_balance
				expect(json).not_to include :num_transactions
				expect(json).not_to include :children
			end
		end

		context 'with empty options' do
			let(:json) { subject.as_json({}) }

			before :each do
				# Access the children association to ensure it is loaded
				subject.children.length
				expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(subject, {}).and_call_original
			end

			context 'category' do
				subject { create :category, name: 'Test Category', children: 1, transactions: 1 }
				let(:child) { json[:children].first }
				let(:child_parent) { child[:parent] }

				before :each do
					expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(subject.children.first, fields: %i[id name direction parent_id parent num_transactions favourite]).and_call_original
					expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(subject, fields: %i[id name direction]).and_call_original
				end

				it 'should return a JSON representation including children' do
					expect(json).to include parent_id: nil
					expect(json).to include num_children: 1
					expect(json).to include parent: nil

					expect(child).to include id: subject.children.first.id
					expect(child).to include name: subject.children.first.name
					expect(child).to include direction: 'outflow'
					expect(child).to include favourite: false
					expect(child).to include parent_id: subject.id
					expect(child).to include num_transactions: 0
					expect(child).not_to include :children

					expect(child_parent).to include id: subject.id
					expect(child_parent).to include name: subject.name
					expect(child_parent).to include direction: subject.direction
					expect(child_parent).not_to include :num_children
					expect(child_parent).not_to include :parent
					expect(child_parent).not_to include :closing_balance
					expect(child_parent).not_to include :num_transactions
					expect(child_parent).not_to include :children
				end
			end

			context 'subcategory' do
				subject { create :subcategory, name: 'Test Category', transactions: 1 }
				let(:parent) { json[:parent] }

				before :each do
					expect(ActiveModelSerializers::SerializableResource).to receive(:new).with(subject.parent, fields: %i[id name direction]).and_call_original
				end

				it 'should return a JSON representation including parent' do
					expect(json).to include parent_id: subject.parent.id
					expect(json).not_to include :children
					expect(parent).to include id: subject.parent.id
					expect(parent).to include name: subject.parent.name
					expect(parent).to include direction: 'outflow'
				end
			end

			after :each do
				expect(json).to include closing_balance: subject.closing_balance
				expect(json).to include num_transactions: 1
			end
		end

		after :each do
			expect(json).to include id: subject.id
			expect(json).to include name: 'Test Category'
			expect(json).to include direction: 'outflow'
			expect(json).to include favourite: false
		end
	end
end
