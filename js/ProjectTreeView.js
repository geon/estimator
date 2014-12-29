"use strict";

var ProjectTreeView = Backbone.View.extend({

	initialize: function (options) {

		this.$title = this.$el.find('h1');

		this.applyModel();
		this.model.on('change', this.applyModel, this);

		this.subTaskListView = new ProjectTreeSubTaskListView({
			el: this.$el.find('ul'),
			collection: this.model.get('tasks')
		});
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
	}
});
