"use strict";

$(function () {

	var project = new Task();

	var projectView = new ProjectView({
		el: $('#main'),
		model: project
	});

	project.fetch({
		url: 'task.json',
		dataType: 'json'
	});
});
