# Copyright (c) 2016 Scott O'Hara, oharagroup.net
# frozen_string_literal: true

# This file is used by Rack-based servers to start the application.

require_relative 'config/environment'

run ::Rails.application
::Rails.application.load_server
