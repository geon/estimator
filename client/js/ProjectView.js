"use strict";

var ProjectView = Backbone.View.extend({

	events: {

		'blur input.js-title': 'collectData',
		'keydown input.js-title': 'onInputKeyDown'
	},


	initialize: function (options) {

		this.$title = this.$el.find('input.js-title');
		this.$projection = this.$el.find('p.js-estimate');

		this.treeEventReciever = _.extend({}, Backbone.Events);

		this.applyModel();
		this.model.on('change', this.applyModel, this);

		// TODO: Does this cause leaks? Use this.listenTo(model, 'eventName', callback) instead?
		this.model.on('focus', function () { this.$title.focus(); }, this);
		this.model.on('close', this.remove, this);

		this.treeView = new ProjectTreeView({
			el: this.$('.tree-view'),
			model: this.model
		});
		this.model.once('sync', function (model) {

			model.calculateProjection();
		})
	},


	onInputKeyDown: function (event) {

		if (event.keyCode == 13) {

			this.collectData();
		}
	},


	onDragStart: function () {

		this.$el.toggleClass('dragging', true);
	},


	onDragStop: function () {

		this.$el.toggleClass('dragging', false);
	},


	applyModel: function () {

		this.$title.val(this.model.get('title'));

		var projection = this.model.get('projection');
		this.$projection
			.text(projection ? (
				Duration.formatRounded(projection.min) +
				' - ' + Duration.formatRounded(projection.max)
			) : 'No projection')
			.toggle(!!projection);
	},


	collectData: function (){

		// Save data.
		this.model.save({
			title: this.$title.val()
		});
	}
});
