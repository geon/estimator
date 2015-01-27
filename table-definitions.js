"use strict";

var sql = require('sql');

sql.setDialect('postgres');

module.exports = {

	tasks: sql.define({
		name: 'tasks',
		columns: [
			'id',
			'projectId',
			'parentId',
			'ordering',

			'title',
			'description',
			'color',

			'from',
			'to',
			'actual',

			'done'
		]
	})
};
