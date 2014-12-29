"use strict";

var ProjectTreeSubTaskView = Backbone.View.extend({

	initialize: function () {

		this.$title = this.$el.find('h1');
		this.$task  = this.$el.find('.task');

		this.setUpDragNDrop();

		this.applyModel();

		this.model.on('change', this.applyModel, this);
		// `add` & `remove` on `tasks` doesn't trigger change.
		this.model.get('tasks').on('add', this.applyModel, this);
		this.model.get('tasks').on('remove', this.applyModel, this);

		this.model.on('remove', this.remove, this);

		this.subTaskListView = new ProjectTreeSubTaskListView({
			el: this.$el.find('ul'),
			collection: this.model.get('tasks')
		});
	},


	setUpDragNDrop: function () {

		this.$el.draggable({

			// handle: '.handle',
			zIndex: 100,
			revert: true,
			revertDuration: 200
		});

		this.$el.data('model', this.model);

		var THIS = this;
		this.$task.find('.drop-target').droppable({

			tolerance: 'pointer',

			over: function ( event, ui ) {

				$(this).toggleClass('drop-hover', true);
			},

			out: function ( event ) {

				$(this).toggleClass('drop-hover', false);
			},

			drop: function( event, ui ) {

				var $dropTarget = $(this);

				// Stop indicating drop target.
				$dropTarget.toggleClass('drop-hover', false);

				// Place dragged before/after drop target.

				// Remove from current collection.
				var model = ui.draggable.data('model');
				model.collection.remove(model);

				// Insert into new.
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
			}
		});
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
		this.$task.attr('data-color', this.model.get('color'));
		this.$el.toggleClass('leaf', !this.model.get('tasks').length);
	}
});
