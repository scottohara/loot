# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

::RSpec.configure do |config|
	config.before(:suite) { ::ActiveRecord::Tasks::DatabaseTasks.truncate_all }
end
