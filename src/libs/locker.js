var path = require('path'),
	lockers = {},
	NON_LOCK = 0
	READ_LOCK = 1,
	WRITE_LOCK = 2
	;



function Locker(id, data) {
	var that = this
		;

	if (lockers[id]) throw new Error('the "' + id + '" is conflicted');

	that._id = id;
	that._data = data || {};
	that._readLocker = false;
	that._writeLocker = false;
	that._mode = NON_LOCK;
	that._reading = 0;
}

Locker.prototype.lockRead = function(callback) {
	var args = arguments,
		that = this,
		data = that._data,
		readLocker = that._readLocker
		;

	if (that._mode === READ_LOCK)  {
		that._reading++;
		callback && callback.call(that, that._data);
	} else {
		if (readLocker) {
			process.nextTick(function() {
				args.callee.apply(that, args);
			})
			return;
		}

		that._readLocker = true;
		that._mode = READ_LOCK;
		that._reading++;
		callback && callback.call(that, data);
	}
}

Locker.prototype.unlockRead = function(callback) {
	var that = this,
		readLocker = that._readLocker
		;


	if (that._mode !== READ_LOCK) 
		throw new Error('can\'t unlock under non-lock or write-lock mode');

	if ((--that._reading) > 0) return;

	that._readLocker = false;
	that._mode = NON_LOCK;
	callback && callback.call(that);
}

Locker.prototype.lockWrite = function(callback) {
	var args = arguments,
		that = this,
		data = that._data,
		readLocker = that._readLocker,
		writeLocker = that._writeLocker
		;

	if (readLocker || writeLocker) {
		process.nextTick(function() {
			args.callee.apply(that, args);
		});
		return;
	}

	that._readLocker = true;
	that._writeLocker = true;
	that._mode = WRITE_LOCK;
	callback && callback.call(that, data);
}

Locker.prototype.unlockWrite = function(callback) {
	var that = this,
		readLocker = that._readLocker,
		writeLocker = that._writeLocker
		;

	if (that._mode !== WRITE_LOCK) 
		throw new Error('can\'t unlock under non-lock or read-lock mode');

	that._writeLocker = false;
	that._readLocker = false;
	that._mode = NON_LOCK;
	callback && callback.call(that);
}

Locker.prototype.getData = function() {
	var that = this
		;

	return that._data;
}

Locker.prototype.destory = function() {
	var that = this,
		id = that._id,
		mode = that._mode
		;

	if (mode === WRITE_LOCK) {
		that.unlockWrite();
	} else if (mode === READ_LOCK) {
		that.unlockRead();
	}
	delete that._data;
	delete lockers[id];
}

module.exports = function(id, data) {
	return (lockers[id] = new Locker(id, data));
};