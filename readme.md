
What is Estimator?
==================

A tool for breaking down a project in manageable tasks, and to estimate the overall time needed to complete them.

Check out [the manual](http:/geon.github.io/estimator/manual.html) for instructions.


What is Estimator *not*?
========================

* An issue tracker.
* A Scrum whiteboard.
* Mobile friendly.
* Very sophisticated and accurate.


Screenies
=========

![Tree-view](http://geon.github.io/estimator/github-readme-images/tree-view.jpg)

![Edit dialog](http://geon.github.io/estimator/github-readme-images/edit-dialog.jpg)


Using Estimator
===============

You can use Estimator right away on the [project website](http:/geon.github.io/estimator/). No account or registration needed, just click the "Create project" button.

If you want to install the software yourself, you need a server with Node.js, Postgre SQL and grunt installed. While any OS should be fine, Estimator has been developed on Mac OS and Ubuntu.

In a console, clone the repo:

	git clone https://github.com/geon/estimator.git

Cd into the server folder:

	cd estimator/server

Install the dependencies:

	npm install

Create and initialize the database:

	psql -c "CREATE DATABASE estimator"
	psql estimator < schema.sql

Edit the connectionString in `config.json`. I should look something like:

	"connectionString": "postgres://myusername:mypassword@localhost/estimator"

Start the server

	node ./bin/www

Then, in another console, cd into the client folder:

	cd ../client

Install the dependencies:

	npm install

Run the Grunt tasks:

	grunt less
	grunt autoprefixer
	grunt jade

Serve the static files with any web server. I like the Node.js based [`http-server`](https://www.npmjs.com/package/http-server).

	http-server

The Estimator interface should now be available on [http://localhost:8080](http://localhost:8080).
