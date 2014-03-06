# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

# Automatically scroll to the bottom of the table on page load
$ ->
	scroller = ->
		$("#transactions").infinite
			direction: $.infinite.directions.up,
			buffer: 300,
			upSelector: "#more-transactions",
			itemSelector: "tr.transaction"

	$(window).on "load", ->
		$(document).scrollTop $("#transactions").height()
		window.setTimeout scroller, 1500
