$(function () {


	var $template = $($.parseHTML($('script.js-task[type=template]').text()));
	var $treeView = $('.tree-view');


	$.ajax({
		url: 'task.json',
		dataType: 'json',
		error: function () {
			console.log('error getting task');
		},
		success: function (task) {

			$treeView.find('ul').append(task.tasks.map(makeLi));

			function makeLi(task) {

				var li = $template.clone();

				li.find('h1').text(task.title).end();
				li.find('.task').addClass(task.color);

				li.find('ul').append(task.tasks && task.tasks.map(makeLi));

				return li;
			}



			$('.tree-view ul li' ).draggable({

				// handle: '.handle',
				zIndex: 100
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

					// Place dragged after drop target.
					var li = $(this).closest('li');
					li.after(ui.draggable);
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
