"use strict";

var ProjectTreeSubTaskView = Backbone.View.extend({

	events: {

		'click h1': 'onTitleClick',
		'blur input': 'onInputBlur',
		'keyup input': 'onInputKeyUp',
		'paste input': 'collectData',

		'click .js-add-sub-task': 'addSubtask',
		'click .js-task-details': 'taskDetails'
	},


	initialize: function (options) {

		this.$task = this.$el.find('.js-task');

		this.$title       = this.$task.find('h1');
		this.$input       = this.$task.find('input');
		this.$description = this.$task.find('.js-description');
		this.$estimate    = this.$task.find('.js-estimate');
		this.$projection  = this.$task.find('.js-projection');
		this.$actual      = this.$task.find('.js-actual');

		this.treeEventReciever = options.treeEventReciever;

		this.setUpDragNDrop();

		this.applyModel();

		this.model.on('change', this.applyModel, this);
		// `add` & `remove` on `tasks` doesn't trigger change.
		this.model.get('tasks').on('add', this.applyModel, this);
		this.model.get('tasks').on('remove', this.applyModel, this);

		this.model.on('focus', this.onTitleClick, this);
		this.model.on('remove', this.remove, this);

		this.subTaskListView = new ProjectTreeSubTaskListView({
			el: this.$el.find('ul'),
			collection: this.model.get('tasks'),
			treeEventReciever: this.treeEventReciever
		});

		this.editDialog = null;
	},


	onTitleClick: function (event) {

		if (event) {

			event.stopPropagation();
		}

		this.$input.val(this.model.get('title'));
		this.$task.toggleClass('editing-title', true);

		this.$input.focus();
	},


	onInputBlur: function (event) {

		event.stopPropagation();

		this.collectData();
		this.$task.toggleClass('editing-title', false);
	},


	onInputKeyUp: function (event) {

		if (event.keyCode == 13) {

			this.onInputBlur(event);
		}
	},


	addSubtask: function (event) {

		event.stopPropagation();

		this.model.get('tasks').create();
	},


	taskDetails: function (event) {

		event.stopPropagation();

		var editDialog = new ModalTaskEditDialogView({
			model: this.model
		});

		editDialog.show();
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

		this.$title.text(this.model.get('title') || String.fromCharCode(160)); // 160: &nbsp;
		this.$task.attr('data-color', this.model.get('color'));
		this.$el.toggleClass('leaf', !this.model.get('tasks').length);
		this.$description
			.html(escapeHtml(this.model.get('description')).replace(/\n/g, '<br>'))
			.toggle(!!this.model.get('description'));

		this.$estimate
			.find('.js-value')
				.text(
					'From ' + Task.formatDuration(this.model.get('from')) +
					' to ' + Task.formatDuration(this.model.get('to'))
				)
				.end()
			.toggle(!this.model.get('actual'))
		;

		var projection = this.model.get('projection');
		this.$projection
			.find('.js-value')
				.text(projection ? (
					'From ' + Task.formatDuration(projection.min) +
					' to ' + Task.formatDuration(projection.max)
				) : 'no projection')
				.end()
			.toggle(!this.model.get('actual'))
		;

		this.$actual
			.find('.js-value')
				.text(Task.formatDuration(this.model.get('actual')))
				.end()
			.toggle(!!this.model.get('actual'))
		;
	},


	collectData: function (){

		// Save data.
		this.model.save({
			title: this.$input.val()
		});
	}
});


function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};
