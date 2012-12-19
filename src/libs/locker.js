var path = require('path'),

	lockPath = path.join(__dirname, '..', 'lock'),
	lockfile = require('lockfile'),
	lockers = {},
	LOCK_WAIT = 10 * 1000,

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
	// that._readLocker = path.join(lockPath, id + '-read.lock');
	// that._writeLocker = path.join(lockPath, id + '-write.lock');
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
		callback.call(that, that._data);
	} else {
		// if (lockfile.checkSync(readLocker)) {
		// 	process.nextTick(function() {
		// 		args.callee.apply(that, args);
		// 	})
		// 	return;
		// }

		// lockfile.lock(readLocker, {
		// 	wait : LOCK_WAIT
		// }, function(err, fd) {
		// 	if (err) throw err;

		// 	that._mode = READ_LOCK;
		// 	that._reading++;
		// 	callback.call(that, that._data);
		// });

		if (readLocker) {
			process.nextTick(function() {
				args.callee.apply(that, args);
			})
			return;
		}

		that._readLocker = true;
		that._mode = READ_LOCK;
		that._reading++;
		callback.call(that, data);
	}
}

Locker.prototype.unlockRead = function(callback) {
	var that = this,
		readLocker = that._readLocker
		;


	if (that._mode !== READ_LOCK) 
		throw new Error('can\'t unlock under non-lock or write-lock mode');

	if ((--that._reading) > 0) return;

	// lockfile.unlock(readLocker, function(err) {
	// 	if (err) throw err;

	// 	that._mode = NON_LOCK;
	// 	callback.call(that);
	// });

	that._readLocker = false;
	that._mode = NON_LOCK;
	callback.call(that);
}

Locker.prototype.lockWrite = function(callback) {
	var args = arguments,
		that = this,
		data = that._data,
		readLocker = that._readLocker,
		writeLocker = that._writeLocker
		;

	// if (lockfile.checkSync(readLocker) ||
	// 		lockfile.checkSync(writeLocker)) {
	// 	process.nextTick(function() {
	// 		args.callee.apply(that, args);
	// 	});
	// 	return;
	// }

	// lockfile.lock(readLocker, {
	// 	wait : LOCK_WAIT
	// }, function(err, fd) {
	// 	if (err) throw err;
		
	// 	lockfile.lock(writeLocker, {
	// 		wait : LOCK_WAIT
	// 	}, function(err, fd) {
	// 		if (err) throw err;

	// 		that._mode = WRITE_LOCK;
	// 		callback.call(that, that._data);
	// 	});
	// });

	if (readLocker || writeLocker) {
		process.nextTick(function() {
			args.callee.apply(that, args);
		});
		return;
	}

	that._readLocker = true;
	that._writeLocker = true;
	that._mode = WRITE_LOCK;
	callback.call(that, data);
}

Locker.prototype.unlockWrite = function(callback) {
	var that = this,
		readLocker = that._readLocker,
		writeLocker = that._writeLocker
		;

	if (that._mode !== WRITE_LOCK) 
		throw new Error('can\'t unlock under non-lock or read-lock mode');

	// lockfile.unlock(writeLocker, function(err) {
	// 	if (err) throw err;

	// 	lockfile.unlock(readLocker, function(err) {
	// 		if (err) throw err;

	// 		that._mode = NON_LOCK;
	// 		callback.call(that);
	// 	});	
	// });

	that._writeLocker = false;
	that._readLocker = false;
	that._mode = NON_LOCK;
	callback.call(that);
}

Locker.prototype.getData = function() {
	var that = this
		;

	return that._data;
}

module.exports = function(id, data) {
	return (lockers[id] = new Locker(id, data));
};