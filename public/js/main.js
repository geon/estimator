"use strict";

$(function () {

	var $projectTemplate = $($.parseHTML(
		$('script.js-project[type=template]').text()
	));
	var $landingTemplate = $($.parseHTML(
		$('script.js-landing[type=template]').text()
	));


	var currentProject = null;
	function closeCurrentProject () {

		if (currentProject) {

			currentProject.trigger('close');
		}
	}


	function openProject () {

		$('#page').children().remove();

		closeCurrentProject();

		currentProject = new Task();

		new ProjectView({
			el: $projectTemplate.clone().appendTo($('#page')),
			model: currentProject
		});
		$('body').attr('data-current-page', 'project');

		return currentProject;
	}


	var router = new (Backbone.Router.extend({

		routes: {
			"": "landingPage",
			"createProject": "createProject",
			"projects/:id": "project"
		},


		landingPage: function () {

			closeCurrentProject();

			$landingTemplate.clone().appendTo($('#page'));
			$('body').attr('data-current-page', 'landing');
		},


		createProject: function() {

			var project = openProject();

			project.createProject();

			// Show the URL of the new project in the address bar.
			router.navigate("projects/"+project.id, {trigger: false, replace: true});
		},


		project: function(id) {

			var project = openProject();

			project.fetch({
				url: apiBaseUrl+'/api/projects/'+id,
				dataType: 'json'
			}).then(null, function (error) {

				// Does not exist yet, so create it.
				if (error.status == 404) {

					project.createProject(id);
				}
			});
		}

	}))();
	Backbone.history.start();
});
