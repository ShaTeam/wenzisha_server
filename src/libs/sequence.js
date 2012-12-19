function Sequence(done, exit) {
	var that = this
		;

	that._list = [];
	that._doneCb = done;
	that._exitCb = exit;
}

Sequence.prototype.push = function(func, funcElse) {
	var that = this,
		list = that._list
		;

	list.push([func, funcElse]);
}

Sequence.prototype.next = function() {
	var args = Array.make(arguments),
		that = this,
		list = that._list,
		func = list.shift()
		;

	if (func[0]) {
		func[0].apply(that, args);
		return true;
	} else {
		return false;
	}
}

Sequence.prototype.nextElse = function() {
	var args = Array.make(arguments),
		that = this,
		list = that._list,
		func = list.shift()
		;

	if (func[1]) {
		func[1].apply(that, args);
		return true;
	} else {
		return false;
	}
}

Sequence.prototype.done = function() {
	var args = Array.make(arguments),
		that = this,
		list = that._list,
		doneCb = that._doneCb
		;

	list = [];

	if (doneCb) {
		doneCb.apply(that, args);
	}
}

Sequence.prototype.exit = function() {
	var args = Array.make(arguments),
		that = this,
		list = that._list,
		exitCb = that._exitCb
		;

	list = [];

	if (exitCb) {
		exitCb.apply(that, args);
	}
}

module.exports = Sequence;