"use strict";

var ProjectTreeSubTaskListView = Backbone.View.extend({

	$template: $($.parseHTML(
		$('script.js-task[type=template]').text()
	)),


	initialize: function (options) {

		this.treeEventReciever = options.treeEventReciever;

		this.collection.map(this.addSubTaskView, this);

		this.collection.on('add', this.addSubTaskView, this);
	},


	addSubTaskView: function (model) {

		var $el = this.$template.clone();

		// Find the DOM element Where the view element should be inserted.
		var elAtIndex = this.$el.children().get(model.index());
		if (elAtIndex) {

			// Insert at index.
			$(elAtIndex).before($el)

		} else {

			// Just append.
			this.$el.append($el)
		}

		var view = new ProjectTreeSubTaskView({
			el: $el,
			model: model,
			treeEventReciever: this.treeEventReciever
		});
	}
});
