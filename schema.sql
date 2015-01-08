
CREATE TABLE tasks (

	"id"          UUID PRIMARY KEY,
	"projectId"   UUID DEFAULT NULL REFERENCES tasks (id) ON DELETE CASCADE,
	"parentId"    UUID DEFAULT NULL REFERENCES tasks (id) ON DELETE CASCADE,
	"ordering"    INT NOT NULL DEFAULT 0,

	"title"       TEXT NOT NULL DEFAULT '',
	"description" TEXT NOT NULL DEFAULT '',
	"color"       TEXT NOT NULL DEFAULT 'white',

	"from"        INT DEFAULT NULL,
	"to"          INT DEFAULT NULL,
	"actual"      INT DEFAULT NULL
);
