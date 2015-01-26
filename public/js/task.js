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

		var topCollection = this;
		while (topCollection.parent.collection) {
			topCollection = topCollection.parent.collection;
		}

		var _arguments = _.toArray(arguments);
		_arguments[0] = _arguments[0] || {
			id: makeGuid(),
			parentId: this.parent.id,
			projectId: topCollection.parent.id
		};
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
		delete attributes.projection;

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
		// Like _.debounce, but uses the *last* arguments.
		// Also, *set* the data immediately.
		var timer = null;
		var originalSave = this.save;
		var THIS = this;
		this.save = function () {

			var outerArguments = arguments;

			THIS.set.apply(THIS, outerArguments);

			if (timer) {

				clearTimeout(timer);
				timer = null;
			}

			timer = setTimeout(function () {

				timer = null;
				originalSave.apply(THIS, outerArguments);

			}, 3000);
		};
		// Prevent debounce from re-saving after delete.
		this.on('destroy', function () {

			// The collection listens to this event and removes as well,
			// but the remove event triggers a save...
			THIS.collection.remove(THIS);

			clearTimeout(timer);
			timer = null;
		});

		this.on('change:from change:to change:actual', function (model) {

			// Recalculate all projections from the top.
			model.projectRoot().calculateProjection();
		});
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
	},


	createProject: function () {

		if (!this.isNew()) {

			throw new Error('You need an unused Taks to create a project.');
		}

		var projectId = makeGuid();

		this.set({
			id: projectId,
			projectId: projectId,
			parentId: null
		});

		this.trigger('focus');
	},


	projectRoot: function () {

		var currentTask = this;

		while (true) {

			if (!currentTask.collection) {

				break;
			}

			currentTask = currentTask.collection.parent;
		}

		return currentTask;
	},


	getDefaultEstimateMax: function () {

		return this.get('from') * 1.5;
	},


	getEstimate: function () {

		return this.get('from') ? {
			min: this.get('from'),
			max: this.get('to') || this.getDefaultEstimateMax()
		} : null;
	},


	calculateProjection: function () {

		// Calculate the projections of the child tasks.
		this.get('tasks').each(function (child) {

			child.calculateProjection();
		});


		// Sum up the projections.
		var childProjections = _.filter(this.get('tasks').pluck('projection'), function (projection) { return !!projection; });
		var childProjectionSum = childProjections.length ? {
			min: _.pluck(childProjections, 'min').reduce(function (a, b) { return a + b; }, 0),
			max: _.pluck(childProjections, 'max').reduce(function (a, b) { return a + b; }, 0)
		} : null;

		if (childProjectionSum) {

			// Calculate un-projected missing time in children.
			var numProjected = childProjections.length;
			var factorProjected = numProjected / this.get('tasks').length;

			// Add the extrapolated time from un-estimated siblings.
			childProjectionSum.min /= factorProjected;
			childProjectionSum.max /= factorProjected;
		}


		var estimate = this.getEstimate();


		var actual = this.get('actual');


		// Use actual data, otherwise the largest numbers of whatever information is available.
		var projection;
		if (actual !== null) {

			projection = {
				min: actual,
				max: actual
			};

		} else {

			if (childProjectionSum && estimate) {

				projection = {
					min: Math.max(estimate.min, childProjectionSum.min),
					max: Math.max(estimate.min, childProjectionSum.max)
				};

			} else if (estimate) {

				projection = estimate;

			} else {

				projection = childProjectionSum;
			}
		}
		this.set('projection', projection);

		// Set the projections for the undefined children.
		this.calculateProjectionDown();
	},

	calculateProjectionDown: function () {

		// TODO:

		// Count un-estimated and sum partial estimates.

		// Calculate un-estimated missing time in children.

		// Spread equally.
	}	
});


// Complete the collection after the model's relations has used it.
Tasks.prototype.model = Task;
