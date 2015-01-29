var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var autoprefixer = require('express-autoprefixer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(autoprefixer({ browsers: 'last 2 versions', cascade: false }));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('connect-jade-static')({
	baseDir: path.join(__dirname, '/public'),
	baseUrl: '/',
	jade: { pretty: false }
}));


var apiRouter = express.Router();
var apiRoutes = require('./routes/api.js');
if (process.env.DEBUG_NET) {

	// 500 - 1500 ms latency.
	apiRouter.use(function(req, res, next) {

		setTimeout(next, 500 + Math.random() * 1000);
	});

	// // Random errors 50% of the time.
	// apiRouter.use(function(req, res, next) {

	// 	if (Math.random() > .5) {

	// 		res.sendStatus(500);

	// 	} else {

	// 		next();
	// 	}
	// });
}
apiRouter.use(function(req, res, next) {

	// CORS-headers.
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
apiRouter.put(   '/tasks/:id',    apiRoutes.tasks.update);
apiRouter.delete('/tasks/:id',    apiRoutes.tasks.delete);
apiRouter.get(   '/projects/:id', apiRoutes.projects.read);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
