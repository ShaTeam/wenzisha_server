function Sequence(done, exit) {
	var that = this
		;

	that._list = [];
	that._data = {};
	that._doneCb = done;
	that._exitCb = exit;
}

Sequence.prototype.push = function(func, funcElse) {
	var that = this,
		list = that._list
		;

	list.push([func, funcElse]);
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

Sequence.prototype.next = function(_data) {
	var that = this,
		list = that._list,
		func = list.shift()
		;

	return _next.call(that, _data, func[0]);
}

Sequence.prototype.nextElse = function(_data) {
	var that = this,
		list = that._list,
		func = list.shift()
		;

	return _next.call(that, _data, func[1]);
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