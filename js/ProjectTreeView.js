"use strict";

var ProjectTreeView = Backbone.View.extend({

	initialize: function (options) {

		this.$title       = this.$el.find('h1');
		this.$subTaskList = this.$el.find('ul');

		this.applyModel();

		this.model.get('tasks').map(this.addSubTaskView, this);

		this.model.on('change', this.applyModel, this);
		this.model.get('tasks').on('add', this.addSubTaskView, this);
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
	}
});
