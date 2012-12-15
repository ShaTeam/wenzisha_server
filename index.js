var express = require('express'),
	app = express()
	;

app.use(express.logger());

app.get('/:name/:action/', function(req, res, next) {
	var name = req.params.name,
		action = req.params.action,
		controller = require('./src/apis/' + name),
		result = controller[action](req, res)
		;


	res.set('Content-Type', 'text/plain; charset=utf-8');
	res.send(JSON.stringify(result));
});

app.listen(88);