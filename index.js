var express = require('express'),
	app = express(),
	port = 88
	;

app.use(express.logger());

app.get('/:name/:action/', function(req, res, next) {
	var name = req.params.name,
		action = req.params.action,
		controller = require('./src/apis/' + name)
		;

	res.set('Content-Type', 'text/plain; charset=utf-8');
	controller[action](req, res);
});

app.listen(port);
console.log('start at port ' + port);