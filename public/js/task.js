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

		this.on('change:from change:to', function (model) {

			model.calculateProjection();
		});
		this.on('change:projection', function (model) {

			model.collection && model.collection.parent.calculateProjection();
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


	calculateProjection: function () {

		// Calculate the projections of the child tasks.
		this.get('tasks').each(function (child) {

			if (!child.get('projection')) {

				child.calculateProjection();
			}
		});

		// Sum up the projections.
		var childProjections = _.filter(this.get('tasks').pluck('projection'), function (projection) { return !!projection; });
		var childSumMin = _.pluck(childProjections, 'min').reduce(function (a, b) { return a + b; }, null);
		var childSumMax = _.pluck(childProjections, 'max').reduce(function (a, b) { return a + b; }, null);
		var min = childSumMin === null ? this.get('from') : Math.max(this.get('from'), childSumMin);
		var max = childSumMax === null ? this.get('to')   : Math.max(this.get('to'),   childSumMax);

		this.set('projection', min && max ? {
			min: min,
			max: max
		} : null);

		// Set the projections for the undefined children.
		// TODO
	}
});


// Units
var minute = 60;
var hour = 60 * minute;
var day = 8 * hour;
var week = 5 * day;
var month = 4 * week;
var year = 45 * week;


Task.parseDuration = function (text) {

	text = text.trim();

	// Default is null. (Empty string.)
	var sum = null;
	
	var timePattern = /((\d+)([.,:]))?(\d+)(\s*(years?|y|months?|mn|weeks?|w|days?|d|h|min|m))?\s*,?\s*/g;
	var matches;
	while ((matches = timePattern.exec(text)) !== null) {

		var value;
		if (matches[2]) {

			var integer = matches[2];
			var separator = matches[3];
			var decimals = matches[4];

			if (separator == ':') {

				value = parseInt(integer, 10) + parseInt(decimals, 10) / 60;

			} else {

				value = parseFloat(integer+'.'+decimals, 10);
			}

		} else {

			value = parseInt(matches[4], 10);
		}

		switch (matches[6]) {

			case 'year':
			case 'y':
				value *= year;
				break;

			case 'month':
			case 'mn':
				value *= month;
				break;

			case 'week':
			case 'w':
				value *= week;
				break;

			case 'day':
			case 'd':
				value *= day;
				break;

			case 'hour':
			case 'h':
				value *= hour;
				break;

			case 'min':
			case 'm':
				value *= minute;
				break;

			default: 
				value *= hour;
				break;
		}

		sum += value;
	}

	return sum;
};


Task.formatDuration = function (seconds) {

	return Task.formatDurationParts(Task.splitDurationToParts(seconds));
};


Task.formatDurationParts = function (parts) {

	if (!parts) {

		return '';
	}

	if (!parts.length) {

		return '0 h';
	}

	return parts.map(function (duration) {

		return duration.value + ' ' + duration.unit + (duration.value != 1 && duration.unit != 'min' && duration.unit != 'h' ? 's' : '');

	}).join(', ');
};


Task.splitDurationToParts = function (seconds) {

	var parts = [];
	var left = seconds;

	[
		[year, 'year'],
		[month, 'month'],
		[week, 'week'],
		[day, 'day'],
		[hour, 'h'],
		[minute, 'min'],
	].forEach(function (size) {

		var value = Math.floor(left / size[0]);

		if (value) {

			parts.push({value: value, unit: size[1]});

			left -= value * size[0];
		}
	});

	return parts;
};


// Complete the collection after the model's relations has used it.
Tasks.prototype.model = Task;
