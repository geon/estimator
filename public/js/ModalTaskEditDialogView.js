"use strict";

var ModalTaskEditDialogView = ModalDialogView.extend({

	// Can't define events here. Add them in initialization.


	$template: $($.parseHTML(
		$('script.js-edit-task-dialog[type=template]').text()
	)),
	

	initialize: function (options) {

		_.extend(this.events, {
			// Update the other views in realtime.
			'change': 'collectData',
			'keyup':  'collectData',
			'paste':  'collectData',

			'click button.js-delete': 'onClickDelete'
		});

		// TODO: Send $el as option to the superclass constructor instead.
		this.$el = this.$template.clone();
		this.el = this.$el.get(0);

		ModalDialogView.prototype.initialize.apply(this, arguments);

		this.$title = this.$('input.js-title');
		this.$description = this.$('textarea.js-description');
		this.$colorInputs = this.$('input[name="color"]');

		this.$from = this.$('input.js-from');
		this.$to = this.$('input.js-to');
		this.$actual = this.$('input.js-actual');

		this.applyModel();

		$('#modal-overlay').append(this.$el);


		this.boundOnModelDestroy = function() {

			this.model = null;
			this.hide();

		}.bind(this);
		this.model.once('destroy', this.boundOnModelDestroy);
	},


	applyModel: function () {

		this.$title.val(this.model.get('title') || String.fromCharCode(160)); // 160: &nbsp;
		this.$description.val(this.model.get('description'));
		this.$colorInputs.filter('[value="' + this.model.get('color') + '"]').prop('checked', true);

		this.$from.val(this.model.get('from'));
		this.$to.val(this.model.get('to'));
		this.$actual.val(this.model.get('actual'));

		// this.$task.attr('data-color', this.model.get('color'));
	},


	hide: function () {

		if (this.model) {

			// Clean up.
			this.model.off(null, this.boundOnModelDestroy);
		}

		ModalDialogView.prototype.hide.apply(this, arguments);
	},


	collectData: function (){

		// Save data.
		this.model.save({
			title: this.$title.val(),
			description: this.$description.val(),
			color: this.$colorInputs.filter(':checked').val(),
			from: parseInt(this.$from.val(), 10),
			to: parseInt(this.$to.val(), 10),
			actual: parseInt(this.$actual.val(), 10)
		});
	},


	onClickDelete: function () {

		var count = this.model.numTasksRecursive();
		if (count <= 1 || confirm('Really delete ' + count + ' tasks?')) {

			this.model.destroy();
		}
	}
});
