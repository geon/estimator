"use strict";

$(function () {

	var project = new Task();

	var projectView = new ProjectView({
		el: $('#main'),
		model: project
	});

	project.once('sync', function () {

		project.get('tasks').trigger('loadProject');
	});

	project.fetch({
		url: 'task.json',
		dataType: 'json'
	});
});
