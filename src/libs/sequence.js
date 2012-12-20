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
		list = that._list
		;

	if (arguments.length === 2 &&
			!Object.isTypeof(funcElse, 'function')) {
		data = funcElse;
		funcElse = null
	}

	list.push([func, funcElse, data]);
}

function _next(_data, func) {
	var that = this,
		data = that._data
		;

	_data && Object.extend(data, _data);

	if (func) {
		func.call(that, data);
		return true;
	} else {
		return false;
	}
}

Sequence.prototype.next = function(data) {
	var that = this,
		list = that._list,
		element = list.shift(),
		func = element[0],
		_data = element[2] || {}
		;

	return _next.call(that, Object.extend(_data, data), func);
}

Sequence.prototype.nextElse = function(data) {
	var that = this,
		list = that._list,
		element = list.shift(),
		func = element[1],
		_data = element[2] || {}
		;

	return _next.call(that, Object.extend(_data, data), func);
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