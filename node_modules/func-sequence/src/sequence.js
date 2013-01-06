function each(object, callback) {
    if (object == null) return;

    if (object instanceof Array ||
            object.hasOwnProperty('length')) {

        Array.prototype.forEach.call(object, callback);

    } else if (typeof object == 'object') {
        for (var name in object) {
            if (object.hasOwnProperty(name)) {
                callback(object[name], name, object);
            }
        }
    }
}

function extend(src, target) {
    var args = Array.prototype.slice.apply(arguments),
        src = args.shift()
    	;

    each(args, function (t) {
        each(t, function (value, name) {
            src[name] = value;
        });
    });

    return src;
}


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
			typeof func !== 'function') {
		opt = func;
	} else if (arguments.length === 2 &&
			typeof funcElse !== 'function') {
		opt.func = func;
		opt.data = funcElse;
	} else {
		opt.func = func;
		opt.funcElse = funcElse;
		opt.data = data;
	}

	list.push(opt);

	return that;
}

function _next(data, func) {
	var that = this
		;

	if (func) {
		func.call(that, data);
	}

	return that;
}

Sequence.prototype.next = function(_data) {
	if (this._list.length === 0) return;

	var that = this,
		list = that._list,
		opt = list.shift(),
		func = opt.func,
		condition = opt.condition,
		data = extend(that._data, opt.data || {}, _data)
		;

	if ((typeof condition === 'function' && 
		!condition.call(that, data)) || 
		(typeof condition !== 'undefined' && !condition)) {
		func = opt.funcElse;
	}

	return _next.call(that, data, func);
}

Sequence.prototype.nextElse = function(_data) {
	if (this._list.length === 0) return;

	var that = this,
		list = that._list,
		opt = list.shift(),
		func = opt.funcElse || opt.func,
		data = extend(that._data, opt.data || {}, _data)
		;

	return _next.call(that, data, func);
}

function _end(_data, func) {
	var that = this,
		list = that._list,
		data = that._data
		;

	_data && extend(data, _data);

	list.splice(0);
	that._data = {};

	if (func) {
		func.call(that, data);
	}

	return that;
}

Sequence.prototype.done = function(_data) {
	var that = this,
		doneCb = that._doneCb
		;

	return _end.call(that, _data, doneCb);

}

Sequence.prototype.exit = function(_data) {
	var that = this,
		exitCb = that._exitCb
		;

	return _end.call(that, _data, exitCb);
}

module.exports = Sequence;