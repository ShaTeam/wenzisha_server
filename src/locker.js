var path = require('path'),
	fs = require('fs'),

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
	that._readLocker = path.join(lockPath, id + '-read.lock');
	that._readLockerFd = null;
	that._writeLocker = path.join(lockPath, id + '-write.lock');
	that._writeLockerFd = null;
	that._mode = NON_LOCK;
	that._reading = 0;
}

Locker.prototype.lockRead = function(callback) {
	var that = this,
		readLocker = that._readLocker
		;

	if (that._mode === READ_LOCK)  {
		cb();
	} else {
		fs.open(readLocker, 'wx', function(err, fd) {
			if (err) throw err;

			that._readLockerFd = fd;
			that._mode = READ_LOCK;
			that._reading++;
			callback.call(that, that._data);
		});

		// lockfile.lock(readLocker, {
		// 	wait : LOCK_WAIT
		// }, function(err, fd) {
		// 	if (err) throw err;

		// 	that._mode = READ_LOCK;
		// 	cb();
		// });
	}
}

Locker.prototype.unlockRead = function(callback) {
	var that = this,
		readLocker = that._readLocker,
		readLockerFd = that._readLockerFd
		;

	if (that._mode !== READ_LOCK) 
		throw new Error('can\'t unlock under non-lock or write-lock mode');

	that._reading--;

	if (that._reading > 0) return;

	fs.unlink(readLocker, function(err) {
		if (err) throw err;

		fs.close(readLockerFd, function(err) {
			if (err) throw err;

			that._readLockerFd = null;
			that._mode = NON_LOCK;
			callback.call(that);
		});
	});

	// lockfile.unlock(readLocker, function(err) {
	// 	if (err) throw err;

	// 	that._mode = NON_LOCK;
	// });	
}

Locker.prototype.lockWrite = function(callback) {
	var that = this,
		readLocker = that._readLocker,
		writeLocker = that._writeLocker
		;

	fs.open(readLocker, 'wx', function(err, fd) {
		if (err) throw err;
		
		that._readLockerFd = fd;

		fs.open(writeLocker, 'wx', function(err, fd) {
			if (err) throw err;

			that._writeLockerFd = fd;
			that._mode = WRITE_LOCK;
			callback.call(that, that._data);
		});
	});

	// lockfile.lock(readLocker, {
	// 	wait : LOCK_WAIT
	// }, function(err, fd) {
	// 	if (err) throw err;
		
	// 	lockfile.lock(writeLocker, {
	// 		wait : LOCK_WAIT
	// 	}, function(err, fd) {
	// 		if (err) throw err;

	// 		that._mode = WRITE_LOCK;
	// 		callback.call(that, that._data, done);
	// 	});
	// });
}

Locker.prototype.unlockWrite = function(callback) {
	var that = this,
		readLocker = that._readLocker,
		readLockerFd = that._readLockerFd,
		writeLocker = that._writeLocker,
		writeLockerFd = that._writeLockerFd
		;

	if (that._mode !== WRITE_LOCK) 
		throw new Error('can\'t unlock under non-lock or read-lock mode');

	fs.unlink(writeLocker, function(err) {
		if (err) throw err;

		fs.close(writeLockerFd, function(err) {
			if (err) throw err;

			that._writeLockerFd = null;

			fs.unlink(readLocker, function(err) {
				if (err) throw err;

				that._readLockerFd = null;

				fs.close(readLockerFd, function(err) {
					if (err) throw err;

					that._mode = NON_LOCK;
					callback.call(that);
				});
			});	
		});
	});

	// lockfile.unlock(writeLocker, function(err) {
	// 	if (err) throw err;

	// 	lockfile.unlock(readLocker, function(err) {
	// 		if (err) throw err;

	// 		that._mode = NON_LOCK;
	// 	});	
	// });
}

Locker.prototype.getData = function() {
	var that = this
		;

	return that._data;
}

module.exports = function(id, data) {
	return (lockers[id] = new Locker(id, data));
};