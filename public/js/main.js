"use strict";

$(function () {

	var $projectTemplate = $($.parseHTML(
		$('script.js-project[type=template]').text()
	));


	var currentProject = null;
	function openProject () {

		if (currentProject) {

			currentProject.trigger('close');
		}

		currentProject = new Task();

		new ProjectView({
			el: $projectTemplate.clone().appendTo($('#page')),
			model: currentProject
		});

		return currentProject;
	}


	var router = new (Backbone.Router.extend({

		routes: {
			"": "start",
			"projects/:id": "project"
		},


		start: function() {

			var project = openProject();

			project.createProject();

			// Show the URL of the new project in the address bar.
			router.navigate("projects/"+project.id, {trigger: false, replace: true});
		},


		project: function(id) {

			var project = openProject();

			project.once('sync', function () {

				project.get('tasks').trigger('loadProject');
			});

			project.fetch({
				url: '/api/projects/'+id,
				dataType: 'json'
			});
		}

	}))();

	Backbone.history.start();
});
