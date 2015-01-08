"use strict";

// Pre-create a plain Collection so it can be used in the model's relations.
var Tasks = Backbone.Collection.extend({

	create: function () {

		// Same as default, but auto-create the guid locally, and trigger 'focus' event.

		var _arguments = _.toArray(arguments);
		_arguments[0] = _arguments[0] || {id: makeGuid()};
		Backbone.Collection.prototype.create.apply(this, _arguments).trigger('focus');
	}
});

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
