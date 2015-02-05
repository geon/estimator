"use strict";

var ModalDialogView = Backbone.View.extend({

	events: {

		'click .js-close': 'hide',
		'click': 'stopClickRomPropagatingToOverlay'
	},


	initialize: function (options) {

		// Listen globally. Kind of ugly, but OK.
		this.boundHide      = this.hide.bind(this);
		this.boundOnKeyDown = this.onKeyDown.bind(this);
		$('#modal-overlay').on('click',   this.boundHide);
		$(document        ).on('keydown', this.boundOnKeyDown);

		this.overlay = ModalOverlayView.getInstance();
	},


	stopClickRomPropagatingToOverlay: function (event) {

		// Clicks within the dialog should not propagate further, causing it to close.
		event.stopPropagation();
	},


	onKeyDown: function (event) {

		event.stopPropagation();

		// 27: esc
		if (event.keyCode == 27) {

			this.hide();
		}
	},


	show: function () {

		this.$el.show();
		this.overlay.show();
	},


	hide: function (options) {

		if (!(options && options.silent)) {

			this.trigger('close', options);
		}

		this.remove();
		this.overlay.hide();

		// Remove global event handlers.
		$('#modal-overlay').off('click',   this.boundHide);
		$(document        ).off('keydown', this.boundOnKeyDown);
	}
});
