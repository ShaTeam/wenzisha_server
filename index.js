require('./src/libs/reset');

module.exports = function(req, res, next) {
	var name = req.params.name,
		action = req.params.action,
		controller = require('./src/apis/' + name)
		;

	res.set('Content-Type', 'text/plain; charset=utf-8');
	controller[action](req, res);
}