var CODE = {
		OK : 0,
		ERROR : 1
	},

	REASON = {
		NO_ROOM : 1 << 0,
		NO_PLAYER : 1 << 1,
		FULL_ROOM : 1 << 2,
		NOT_ADMIN : 1 << 3,
		NO_PERMISSION : 1 << 4,
		UNKNOW : 1 << 10
	}
	;

function Result(req, res) {
	var that = this
		;

	that._req = req;
	that._res = res;
	that._result = {
		startTimestamp : null,
		endTimestamp : null
	}

	that._start();
}

Result.prototype._start = function() {
	var that = this,
		result = that._result
		;

	result.startTimestamp = Date.now();
}

Result.prototype._end = function() {
	var that = this,
		res = that._res,
		result = that._result
		;
		
	result.endTimestamp = Date.now();
	res.jsonp(result);
}


Result.prototype.no_room_error = function() {
	var that = this,
		result = that._result
		;

	Object.extend(result, {
		code : CODE.ERROR,
		reason : REASON.NO_ROOM
	});

	that._end();
}

Result.prototype.full_room_error = function() {
	var that = this,
		result = that._result
		;

	Object.extend(result, {
		code : CODE.ERROR,
		reason : REASON.FULL_ROOM
	});

	that._end();
}

Result.prototype.no_player_error = function() {
	var that = this,
		result = that._result
		;

	Object.extend(result, {
		code : CODE.ERROR,
		reason : REASON.NO_PLAYER,
	});

	that._end();
}

Result.prototype.not_admin_error = function() {
	var that = this,
		result = that._result
		;

	Object.extend(result, {
		code : CODE.ERROR,
		reason : REASON.NOT_ADMIN,
	});

	that._end();
}

Result.prototype.no_permission_error = function() {
	var that = this,
		result = that._result
		;

	Object.extend(result, {
		code : CODE.ERROR,
		reason : REASON.NO_PERMISSION
	});

	that._end();
}

Result.prototype.ok = function(params) {
	var that = this,
		result = that._result
		;

	Object.extend(result, params, {
		code : CODE.OK
	});

	that._end();
}

module.exports = Result;