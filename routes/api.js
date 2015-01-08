
var progres = require('progres-convenience');
var tasks = require('../table-definitions.js').tasks;
var config = require('../config.json');

module.exports = {

	tasks: {

		create: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				return client.insert(tasks, req.body).then(function (created) {

					res.status(201).json(created);
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'create', error);
			});
		},


		read: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				return client.selectOne(tasks, {id: req.params.id}).then(function (read) {

					res.json(read);
				});

			}).done(null, function (error) {

				res.sendStatus(500);
				console.error(new Date(), 'read', error);
			});
		},


		update: function (req, res) {

			progres.connect(config.connectionString, function (client) {

				// Upsert
				return client.update(tasks, {id: req.params.id}, req.body).then(function (updated) {

					if (updated.length) {
 console.log('updated: ', updated);
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
	}
};
