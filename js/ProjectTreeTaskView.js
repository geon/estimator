"use strict";

var ProjectTreeTaskView = Backbone.View.extend({

	initialize: function () {

		// On first run, set the template.
		// Can't be done outside this initializer, since
		// it must be run after document.ready, but before the app starts. 
		ProjectTreeTaskView.prototype.$template = $($.parseHTML($('script.js-task[type=template]').text()));

		// Replace the initializer with the normal code.
		ProjectTreeTaskView.prototype.initialize = function (options) {

			this.$el = this.$template.clone();

			this.$title       = this.$el.find('h1');
			this.$subTaskList = this.$el.find('ul');
			this.$task        = this.$el.find('.task');

			this.setUpDragNDrop();

			this.applyModel();

			this.model.get('tasks').map(this.addSubTaskView, this);

			this.model.on('change', this.applyModel, this);
			this.model.get('tasks').on('add', this.addSubTaskView, this);
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

				// Stop indicating drop target.
				$(this).toggleClass('drop-hover', false);

				// Place dragged before/after drop target.
				if ($(this).hasClass('before')) {

					THIS.$el.before(ui.draggable);
				}
				if ($(this).hasClass('after')) {

					THIS.$el.after(ui.draggable);
				}
				if ($(this).hasClass('child')) {

					THIS.$subTaskList.append(ui.draggable);
				}
				ui.draggable.css({
					left: 0,
					top: 0
				});

				// Re-enable draggable.
				THIS.$el.draggable({

					// handle: '.handle',
					zIndex: 100
				});
			}
		});
	},


	addSubTaskView: function (model) {

		var view = new ProjectTreeTaskView({
			model: model
		});

		this.$subTaskList.append(view.$el);
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
		// TODO: Make it work when changing color.
		this.$task.addClass(this.model.get('color'));
		this.$el.toggleClass('leaf', !this.model.get('tasks').length);
	}
});
