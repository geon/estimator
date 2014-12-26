"use strict";

$(function () {


	var $template = $($.parseHTML($('script.js-task[type=template]').text()));
	var $treeView = $('.tree-view');

	var task = new Task();
	task.fetch({
		url: 'task.json',
		dataType: 'json',
		error: function () {
			console.log('error getting task');
		},
		success: function (task) {

			$treeView.find('ul').append(task.get('tasks').map(makeLi));

			function makeLi(task) {

				var $li = $template.clone();

				$li.find('h1').text(task.get('title')).end();
				$li.find('.task').addClass(task.get('color'));

				if (task.get('tasks')) {

					$li.find('ul').append(task.get('tasks').map(makeLi));

				} else {

					$li.addClass('leaf');
				}

				return $li;
			}



			$('.tree-view ul li' ).draggable({

				// handle: '.handle',
				zIndex: 100,
				revert: true,
				revertDuration: 200
			});

			$('.task .drop-target').droppable({

				tolerance: 'pointer',

				over: function ( event, ui ) {

					console.log('over', event, ui);

					$(this).toggleClass('drop-hover', true);
				},

				out: function ( event ) {

					console.log('out', event);

					$(this).toggleClass('drop-hover', false);
				},

				drop: function( event, ui ) {

					console.log('drop', event, ui);

					// Stop indicating drop target.
					$(this).toggleClass('drop-hover', false);

					// Place dragged before/after drop target.
					var li = $(this).closest('li');
					if ($(this).hasClass('before')) {

						li.before(ui.draggable);
					}
					if ($(this).hasClass('after')) {

						li.after(ui.draggable);
					}
					if ($(this).hasClass('child')) {

						li.children('ul').append(ui.draggable);
					}
					ui.draggable.css({
						left: 0,
						top: 0
					});

					// Re-enable draggable.
					li.draggable({

						// handle: '.handle',
						zIndex: 100
					});
				}
			});


		}
	});






});
