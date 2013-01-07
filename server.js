var express = require('express'),
	index = require('./index'),
	app = express(),
	port = 88
	;

app.use(express.logger());
app.get('/:name/:action/?', index);
app.listen(port);

console.log('start at port ' + port);