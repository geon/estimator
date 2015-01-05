"use strict";

var ModalOverlayView = Backbone.View.extend({

	initialize: function (options) {

		this.depthCount = 0;
	},


	show: function () {

		this.depthCount++;
		this.$el.toggleClass('modal-overlay', !!this.depthCount);
	},


	hide: function () {

		this.depthCount--;
		this.$el.toggleClass('modal-overlay', !!this.depthCount);

		if (this.depthCount < 0) {

			console.error('Last modal overlay already hidden.');
		}
	}
});


ModalOverlayView.getInstance = function () {

	if (!this._instance) {
		
		this._instance = new this({
			el: $('body')
		});
	}

	return this._instance;
}
