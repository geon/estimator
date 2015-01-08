"use strict";

// Pre-create a plain Collection so it can be used in the model's relations.
var Tasks = Backbone.Collection.extend({

	initialize: function () {

		// After the first fetch...
		this.once('loadProject', function () {

			// Recurse.
			this.each(function (model) {

				model.get('tasks').trigger('loadProject');
			});

			// Track relative order.
			this.on('add',    this.updateOrdering, this);
			this.on('remove', this.updateOrdering, this);


			// Track parent.

			this.on('add', function (model) {

				// New place in the the project tree.
				model.save({parentId: this.parent.id});

			}.bind(this));

			this.on('remove', function (model) {

				// No longer part of the project tree.
				model.save({parentId: null});
			});

		}.bind(this));
	},


	create: function () {

		// Same as default, but auto-create the guid locally, and trigger 'focus' event.

		var _arguments = _.toArray(arguments);
		_arguments[0] = _arguments[0] || {id: makeGuid()};
		Backbone.Collection.prototype.create.apply(this, _arguments).trigger('focus');
	},


	updateOrdering: function () {

		this.models.forEach(function (model, index) {

			model.save({ordering: index});
		});
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


	save: function(changedAttributes, options) {

		// The model data as they would look after saving.
		var attributes = _.extend(_.clone(this.attributes), changedAttributes);

		// But some stuff shouldn't be sent.
		delete attributes.tasks;

		// Override what gets sent to the server.
		options = options || {};
		options.data = JSON.stringify(attributes);
		options.contentType = "application/json"

		// Proxy the call to the original save function. (Actually saving the model data, doing server requests, triggering events, etc.)
		Backbone.Model.prototype.save.call(this, changedAttributes, options);
	},


	initialize: function () {

		// So the subtasks can find their parentId.
		this.get('tasks').parent = this;

		// Replace save with a locally debounced version for each instance.
		this.save = _.debounce(this.save, 3000);
	},


	index: function () {

		// If it doesn't belong to a collection.
		if (!this.collection) {

			return 0;
		}

		var indexOf = this.collection.models.indexOf(this);

		// If it hasn't been added just yet. (During creation.)
		if (indexOf === -1) {

			return undefined;
		}

		return indexOf;
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
