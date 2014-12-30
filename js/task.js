"use strict";

// Pre-create a plain Collection so it can be used in the model's relations.
var Tasks = Backbone.Collection.extend({});

var Task = Backbone.Model.extend({

	defaults: {
		tasks: []
	},

	relations: {
		tasks: Tasks
	},

	index: function () {

		return this.collection.models.indexOf(this);
	}
});

// Complete the collection after the model's relations has used it.
Tasks.prototype.model = Task;
