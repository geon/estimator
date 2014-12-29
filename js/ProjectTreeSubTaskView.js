"use strict";

var ProjectTreeSubTaskView = Backbone.View.extend({

	initialize: function (options) {

		this.$title = this.$el.find('h1');
		this.$task  = this.$el.find('.task');

		this.treeEventReciever = options.treeEventReciever;

		this.setUpDragNDrop();

		this.applyModel();

		this.model.on('change', this.applyModel, this);
		// `add` & `remove` on `tasks` doesn't trigger change.
		this.model.get('tasks').on('add', this.applyModel, this);
		this.model.get('tasks').on('remove', this.applyModel, this);

		this.model.on('remove', this.remove, this);

		this.subTaskListView = new ProjectTreeSubTaskListView({
			el: this.$el.find('ul'),
			collection: this.model.get('tasks'),
			treeEventReciever: this.treeEventReciever
		});
	},


	setUpDragNDrop: function () {

		this.$el.draggable({

			// handle: '.handle',
			zIndex: 100,
			revert: true,
			revertDuration: 200,

			start: function () {

				this.treeEventReciever.trigger('dragStart');
			}.bind(this),

			stop: function () {

				this.treeEventReciever.trigger('dragStop');
			}.bind(this)
		});

		this.$el.data('model', this.model);

		var THIS = this;
		this.$task.find('.drop-target').droppable({

			tolerance: 'pointer',

			drop: function(event, ui) {

				// Wait until next frame, or the draggable `stop` event doesn't fire. Ugly.
				setTimeout(function () {

					var $dropTarget = $(this);

					// Stop indicating drop target.
					$dropTarget.toggleClass('drop-hover', false);

					// Place dragged before/after drop target.

					// Remove from current collection.
					var model = ui.draggable.data('model');
					model.collection.remove(model);

					// Insert into new collection.
					var dropTargetIndex = THIS.model.index();
					switch ($dropTarget.attr('rel')) {

						case 'before': {
							
							THIS.model.collection.add(
								model,
								{at: dropTargetIndex}
							);

						} break;

						case 'after': {
							
							THIS.model.collection.add(
								model,
								{at: dropTargetIndex + 1}
							);

						} break;

						case 'child': {
							
							THIS.model.get('tasks').add(model);

						} break;
					}
				}.bind(this), 0);
			}
		});
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
		this.$task.attr('data-color', this.model.get('color'));
		this.$el.toggleClass('leaf', !this.model.get('tasks').length);
	}
});
