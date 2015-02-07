"use strict";

var ProjectTreeView = Backbone.View.extend({

	events: {

		'click button.add-sub-task': 'onClickAdd'
	},


	initialize: function (options) {

		this.treeEventReciever = _.extend({}, Backbone.Events);

		this.treeEventReciever.on('dragStart', this.onDragStart, this);
		this.treeEventReciever.on('dragStop',  this.onDragStop,  this);

		this.subTaskListView = new ProjectTreeSubTaskListView({
			el: this.$el.find('ul'),
			collection: this.model.get('tasks'),
			treeEventReciever: this.treeEventReciever
		});
	},


	onClickAdd: function () {

		this.model.get('tasks').create();
	},


	onDragStart: function () {

		this.$el.toggleClass('dragging', true);
	},


	onDragStop: function () {

		this.$el.toggleClass('dragging', false);
	}
});
