# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

require 'simplecov'
::SimpleCov.start 'rails' do
	coverage_dir 'coverage/backend'
	enable_coverage :branch
	enable_coverage :method
	cover '{app,lib}/**/*.{rb,rake}'
	minimum_coverage line: 100, branch: 100, method: 100
end
