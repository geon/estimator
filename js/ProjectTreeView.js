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

		var children = this.$subTaskList.children();
		if (children.length) {

			//Find the position of the model in the collection.
			var index = model.index();

			// Insert at index.
			var childAtIndex = children.get(index);
			if (childAtIndex) {

				$(childAtIndex).before(view.$el)

			} else {

				this.$subTaskList.append(view.$el)
			}

		} else {

			this.$subTaskList.append(view.$el)
		}
	},


	applyModel: function () {

		this.$title.text(this.model.get('title'));
	}
});
