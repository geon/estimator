"use strict";

var ModalTaskEditDialogView = ModalDialogView.extend({

	// Can't define events here. Add them in initialization.


	$template: $($.parseHTML(
		$('script.js-edit-task-dialog[type=template]').text()
	)),
	

	initialize: function (options) {

		// Copy model attributes for cancel.
		this.oldModelAttributes = _.extend({}, this.model.attributes);

		_.extend(this.events, {
			// Update the other views in realtime.
			'change input.js-title, textarea.js-description, .js-estimates input, input[name="color"], input.js-done': 'collectData',
			'keyup input.js-title, textarea.js-description': 'collectData',
			'paste input.js-title, textarea.js-description': 'collectData',

			'click button.js-delete': 'onClickDelete',
			'click button.js-save'  : 'onClickSave'
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

		this.$done = this.$('input.js-done');

		this.applyModel();

		$('#modal-overlay').append(this.$el);


		this.boundOnModelDestroy = function() {

			this.model = null;
			this.hide();

		}.bind(this);
		this.model.once('destroy', this.boundOnModelDestroy);

		this.model.on('change:done', this.onChangeDone, this);
		this.model.on('change:actual', this.onChangeActual, this);
		this.model.on('change:from change:to change:actual change:done', this.onChangeEstimateAndActualAndDone, this);

		this.once('close', this.cancel, this);
	},


	applyModel: function () {

		this.$title.val(this.model.get('title'));
		this.$description.val(this.model.get('description'));
		this.$colorInputs.filter('[value="' + this.model.get('color') + '"]').prop('checked', true);

		this.onChangeEstimateAndActualAndDone();

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

		this.model.set({
			title: this.$title.val(),
			description: this.$description.val(),
			color: this.$colorInputs.filter(':checked').val(),
			from: Duration.parse(this.$from.val()),
			to: Duration.parse(this.$to.val()),
			actual: Duration.parse(this.$actual.val()),
			done: this.$done.prop('checked')
		});
	},


	onChangeDone: function () {

		if (this.model.get('done')) {

			this.$actual.focus();
		}
	},


	onChangeActual: function () {

		if (this.model.get('actual') != null) {

			this.model.set({'done': true});
		}
	},


	onChangeEstimateAndActualAndDone: function () {

		this.$from.val(Duration.format(this.model.get('from')));
		var defaultEstimateMax = this.model.getDefaultEstimateMax();
		this.$to
			.attr('placeholder', defaultEstimateMax ? Duration.format(defaultEstimateMax) : 'Unknown')
			.val(Duration.format(this.model.get('to')));
		this.$actual.val(Duration.format(this.model.get('actual')));

		this.$done.prop('checked', this.model.get('done'));
	},


	onClickDelete: function () {

		var count = this.model.numTasksRecursive();
		if (count <= 1 || confirm('Really delete ' + count + ' tasks?')) {

			this.model.destroy();
		}
	},


	onClickSave: function () {

		this.hide({silent: true});
		this.model.save();
	},


	cancel: function () {

		this.model.set(this.oldModelAttributes);
	}
});
