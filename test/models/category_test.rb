require 'test_helper'

describe Category do
	let(:category_name) { "Test Category"}
	let(:valid_attributes) { {:name => category_name, :direction => 'outflow'} }
	let(:category) { Category.new valid_attributes }
	let(:existing_category) { categories(:food) }

	it "should be valid with valid attributes" do
		category.must_be :valid?
	end

	it "should be invalid without a name or" do
		valid_attributes.delete :name
		category.wont_be :valid?
	end

	it "should be invalid without a direction" do
		valid_attributes.delete :direction
		category.wont_be :valid?
	end

	it "should be invalid if direction is invalid" do
		valid_attributes[:direction] = 'not a valid direction'
		category.wont_be :valid?
	end

	describe "when asked for a category" do
		it "should return an existing category" do
			category = Category.find_or_new({'id' => existing_category.id})
			category.must_be_instance_of Category
			category.must_equal existing_category
		end

		it "should create a non-existing top-level category" do
			category = Category.find_or_new category_name
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'outflow'
		end

		let(:parent_outflow_category) { categories(:groceries) }

		it "should create a non-existing outflow subcategory" do
			category = Category.find_or_new category_name, parent_outflow_category
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'outflow'
			category.parent.must_equal parent_outflow_category
		end

		let(:parent_inflow_category) { categories(:employment) }

		it "should create a non-existing inflow subcategory" do
			category = Category.find_or_new category_name, parent_inflow_category
			category.must_be_instance_of Category
			category.id.must_be_nil
			category.name.must_equal category_name
			category.direction.must_equal 'inflow'
			category.parent.must_equal parent_inflow_category
		end
	end

	describe "when asked for a JSON representation" do
		let(:json) { {"id" => existing_category.id, "name" => existing_category.name, "direction" => existing_category.direction, "parent_id" => existing_category.parent.id} }

		it "should return a JSON-like hash" do
			existing_category.as_json.must_equal json
		end
	end
end
