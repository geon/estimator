"use strict";

var ProjectTreeSubTaskListView = Backbone.View.extend({

	initialize: function (options) {

		// On first run, set the template.
		// Can't be done outside this initializer, since
		// it must be run after document.ready, but before the app starts. 
		ProjectTreeSubTaskListView.prototype.$template = $($.parseHTML(
			$('script.js-task[type=template]').text()
		));

		// Replace the initializer with the normal code.
		ProjectTreeSubTaskListView.prototype.initialize = function (options) {

			this.treeEventReciever = options.treeEventReciever;

			this.collection.map(this.addSubTaskView, this);

			this.collection.on('add', this.addSubTaskView, this);
		};

		// Run the initializer manually the first time.
		ProjectTreeSubTaskListView.prototype.initialize.apply(this, arguments);
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
