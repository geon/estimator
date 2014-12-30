"use strict";

$(function () {

	var task = new Task();

	var treeView = new ProjectTreeView({
		el: $('.tree-view'),
		model: task
	});

	task.fetch({
		url: 'task.json',
		dataType: 'json'
	});
});
