
var progres = require('progres-convenience');
var tasks = require('../table-definitions.js').tasks;
var config = require('../config.json');

module.exports = {

	tasks: {

		update: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				// Upsert
				return client.update(tasks, {id: req.params.id}, req.body).then(function (updated) {

					if (updated.length) {

 						res.json(updated[0]);
						return;
					}

					return client.insert(tasks, req.body).then(function (created) {

						res.status(201).json(created);
					});
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'update', error);
			});
		},


		delete: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				return client.delete(tasks, {id: req.params.id}).then(function () {

					res.sendStatus(204);
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'update', error);
			});
		}
	},


	projects: {

		read: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				return client.queryGenerated(tasks
					.select()
					.where({projectId: req.params.id})
					.order(tasks.parentId, tasks.ordering)
				).then(function (tasks) {

					// Build lookup table.
					var tasksById = {};
					tasks.forEach(function (task) {

						tasksById[task.id] = task;
					})

					tasks.forEach(function (task) {

						// Attach each task to it's parent.
						var parent = tasksById[task.parentId];
						if (parent) {

							if (!parent.tasks) {

								parent.tasks = [];
							}
							
							parent.tasks.push(task)
						}

						// No point in sending this.
						delete task.parentId;
						delete task.projectId;
					});

					res.json(tasksById[req.params.id]);
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'read', error);
			});
		}
	}
};
