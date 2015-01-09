
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

					var root;

					tasks.forEach(function (task) {

						if (task.id === req.params.id) {

							delete task.parentId;
							delete task.projectId;
							root = task;
						}

						for (var i = 0; i < tasks.length; i++) {

							if (tasks[i].id === task.parentId) {

								if (!tasks[i].tasks) {

									tasks[i].tasks = [];
								}

								delete task.parentId;
								delete task.projectId;
								tasks[i].tasks.push(task);

								break;
							}
						}
					});

					res.json(root);
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'read', error);
			});
		}
	}
};
