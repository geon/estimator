"use strict";

var ModalDialogView = Backbone.View.extend({

	events: {

		'click .js-close': 'hide'
	},


	initialize: function (options) {

		this.visible = false;

		// Listen globally. Kind of ugly, but OK.
		$(document).on('keydown', this.onKeyDown.bind(this));

		this.overlay = ModalOverlayView.getInstance();
	},


	onKeyDown: function (event) {

		event.stopPropagation();

		// 27: esc
		if (event.keyCode == 27) {

			this.hide();
		}
	},


	show: function () {

		if (!this.visible) {

			this.$el.show();
			this.overlay.show();

			this.visible = true;
		}
	},


	hide: function () {

		if (this.visible) {

			this.$el.hide();
			this.overlay.hide();

			this.visible = false;
		}
	}
});


ModalDialogView.getInstance = function () {

	if (!this._instance) {
		
		this._instance = new this({
			el: $('.js-edit-task-dialog')
		});
	}

	return this._instance;
}
