function Sequence(done, exit) {
	var that = this
		;

	that._list = [];
	that._data = {};
	that._doneCb = done;
	that._exitCb = exit;
}

Sequence.prototype.push = function(func, funcElse, data) {
	var that = this,
		list = that._list,
		opt = {}
		;

	if (arguments.length === 1 && 
			!Object.isTypeof(func, 'function')) {
		opt = func;
	} else if (arguments.length === 2 &&
			!Object.isTypeof(funcElse, 'function')) {
		opt.func = func;
		opt.data = funcElse;
	} else {
		opt.func = func;
		opt.funcElse = funcElse;
		opt.data = data;
	}

	list.push(opt);
}

function _next(_data, func) {
	var that = this,
		data = that._data
		;

	Object.extend(data, _data);

	if (func) {
		func.call(that, data);
		return true;
	}
}

Sequence.prototype.next = function(_data) {
	var that = this,
		list = that._list,
		opt = list.shift(),
		func = opt.func,
		condition = opt.condition,
		data = opt.data || {},
		type = Object.isTypeof(condition)
		;

	Object.extend(data, _data);

	if ((type === 'function' && 
		!condition.call(that, data)) || 
		(type !== 'undefined' && !condition)) {
		func = opt.funcElse;
	}

	return _next.call(that, data, func);
}

Sequence.prototype.nextElse = function(_data) {
	var that = this,
		list = that._list,
		opt = list.shift(),
		func = opt.funcElse || opt.func,
		data = opt.data || {}
		;

	Object.extend(data, _data);

	return _next.call(that, data, func);
}

function _end(_data, func) {
	var that = this,
		list = that._list,
		data = that._data
		;

	_data && Object.extend(data, _data);

	list.splice(0);
	that._data = {};

	if (func) {
		func.call(that, data);
	}
}

Sequence.prototype.done = function(_data) {
	var that = this,
		doneCb = that._doneCb
		;

	_end.call(that, _data, doneCb);
}

Sequence.prototype.exit = function(_data) {
	var that = this,
		exitCb = that._exitCb
		;

	_end.call(that, _data, exitCb);
}

module.exports = Sequence;