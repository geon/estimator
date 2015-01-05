"use strict";

// Pre-create a plain Collection so it can be used in the model's relations.
var Tasks = Backbone.Collection.extend({});

var Task = Backbone.Model.extend({

	defaults: {
		color: 'white',
		tasks: []
	},


	relations: {
		tasks: Tasks
	},


	url: function () {

		return '/api/tasks/' + this.id;
	},


	index: function () {

		return this.collection.models.indexOf(this);
	},


	numTasksRecursive: function () {

		return this.get('tasks')
			.map(function (child) { return child.numTasksRecursive(); })
			.reduce(function (soFar, next) { return soFar + next; }, 0)
			+ 1;
	}
});

// Complete the collection after the model's relations has used it.
Tasks.prototype.model = Task;
