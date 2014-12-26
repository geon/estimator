"use strict";

var ProjectTreeTaskView = Backbone.View.extend({

	initialize: function () {

		// On first run, set the template.
		// Can't be done outside this initializer, since
		// it must be run after document.ready, but before the app starts. 
		ProjectTreeTaskView.prototype.$template = $($.parseHTML(
			$('script.js-task[type=template]').text()
		));

		// Replace the initializer with the normal code.
		ProjectTreeTaskView.prototype.initialize = function (options) {

			this.$el = this.$template.clone();

			this.$title       = this.$el.find('h1');
			this.$subTaskList = this.$el.find('ul');
			this.$task        = this.$el.find('.task');

			this.setUpDragNDrop();

			this.applyModel();

			this.model.get('tasks').map(function (model) {

				this.addSubTaskView(model, this.model.get('tasks'), {});
			}, this);

			this.model.on('change', this.applyModel, this);
			this.model.get('tasks').on('add', this.applyModel, this);
			this.model.get('tasks').on('remove', this.applyModel, this);

			this.model.get('tasks').on('add', this.addSubTaskView, this);
			this.model.on('remove', this.remove, this);
		};

		// Run the initializer manually the first time.
		ProjectTreeTaskView.prototype.initialize.apply(this, arguments);
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


	addSubTaskView: function (model) {

		var view = new ProjectTreeTaskView({
			model: model
		});

		// Find the DOM element Where the view element should be inserted.
		var elAtIndex = this.$subTaskList.children().get(model.index());
		if (elAtIndex) {

			// Insert at index.
			$(elAtIndex).before(view.$el)

		} else {

			// Just append.
			this.$subTaskList.append(view.$el)
		}
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
		this.$task.attr('data-color', this.model.get('color'));
		this.$el.toggleClass('leaf', !this.model.get('tasks').length);
	}
});
