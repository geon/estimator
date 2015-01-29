"use strict";

// Pre-create a plain Collection so it can be used in the model's relations.
var Tasks = Backbone.Collection.extend({

	initialize: function () {

		// Track parent.
		// (Setting parent to null on remove is dangerous and pointless.)
		this.on('add', function (model) {

			var changed = false;
			if (model.get('parentId') != this.parent.id) {

				// New place in the the project tree.
				model.set({parentId: this.parent.id});
				changed = true;
			}

			// The model will probably be saved in updateOrdering, so
			// check if the order changed (was saved), otherwise save.
			// Don't wanna save twice.
			var oldOrdering = model.get('ordering');
			setTimeout(function () {

				var saved = true;

				if (oldOrdering == model.get('ordering')) {

					saved = false;
				}

				if (changed && !saved) {

					model.save()
				}
			}, 0);

		}.bind(this));

		// Track relative order.
		this.on('add',    this.updateOrdering, this);
		this.on('remove', this.updateOrdering, this);

		// Re-project.
		this.on('add', function (model) {

			model.projectRoot().calculateProjection();
		});
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

			if (model.get('ordering') != index) {

				model.save({ordering: index});
			}
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

		return apiBaseUrl+'/api/tasks/'+this.id;
	},

	parse: function(resp, options) {

		// Initialize the models with the attributes implied by the tree structure.
		function setImpliedAttributesOnChildren (task) {

			if (task.tasks) {

				task.tasks.forEach(function (child, index) {

					child.ordering = index;
					child.parentId = task.id;

					setImpliedAttributesOnChildren(child);
				});
			}
		}
		resp.ordering = 0;
		setImpliedAttributesOnChildren(resp);

		return Backbone.Model.prototype.parse.apply(this, arguments);
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

		this.on('change:from change:to change:actual', function (model) {

			// Recalculate all projections from the top.
			model.projectRoot().calculateProjection();
		});

		this.on('destroy', function (model) {

			var root = model.projectRoot();

			// WARNING: Ugly.
			// Wait until *after* the object got destroyed to recalculate.
			setTimeout(function () {

				root.calculateProjection();

			}, 0);
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


		// Sum up the childrens projections.
		var childProjections = _.filter(this.get('tasks').pluck('projection'), function (projection) { return !!projection; });
		var numProjected = childProjections.length;
		var factorProjectedChildren = numProjected / this.get('tasks').length;
		var childProjectionSum = childProjections.length ? {
			min: _.pluck(childProjections, 'min').reduce(function (a, b) { return a + b; }, 0),
			max: _.pluck(childProjections, 'max').reduce(function (a, b) { return a + b; }, 0)
		} : null;
		if (childProjectionSum) {

			// Add the extrapolated time from un-estimated siblings.
			childProjectionSum.min /= factorProjectedChildren;
			childProjectionSum.max /= factorProjectedChildren;
		}


		var estimate = this.getEstimate();


		var actual = this.get('actual');


		// Use actual data, otherwise the largest numbers of whatever information is available.
		var projection;
		if (actual != null) {

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
		var unprojectedTotal = projection ? {
			min: projection.min * (1 - factorProjectedChildren),
			max: projection.max * (1 - factorProjectedChildren)
		} : null;
		this.calculateProjectionDown(unprojectedTotal);
	},

	calculateProjectionDown: function (unprojectedTotal) {

		if (!unprojectedTotal) {

			return;
		}

		// Find the child-tasks without projections.
		var unprojected = this.get('tasks').filter(function (task) {

			return !task.get('projection');
		});

		// Spread equally.
		var unprojectedDivided = {
			min: unprojectedTotal.min / unprojected.length,
			max: unprojectedTotal.max / unprojected.length
		};
		unprojected.forEach(function (task) {

			task.set('projection', unprojectedDivided);
			task.calculateProjectionDown(unprojectedDivided);
		});
	}	
});


// Complete the collection after the model's relations has used it.
Tasks.prototype.model = Task;
