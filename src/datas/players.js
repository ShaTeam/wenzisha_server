var ALIVE_TIME = 24 * 60 * 60 * 1000 * 2,
	TYPE = {
		ADMIN : 0,
		NOT_AMDIN : 1
	},
	CHARACTER = {
		GOD : 1,
		PEOPLE : 2,
		ONI : 3,
		IDIOT : 4
	},
	STATUS = {
		IDLE : 0,
		GAME : 1
	},

	uuid = require('uuid-js'),
	locker = require('../libs/locker'),
	playersLCK = locker('players')
	;

exports.TYPE = TYPE;
exports.CHARACTER = CHARACTER;
exports.STATUS = STATUS;

exports.create = function(isAdmin, callback) {
	var that = this,
		playerId = uuid.create().toString(),
		player = {
			id : playerId,
			type : isAdmin ? TYPE.ADMIN : TYPE.NOT_AMDIN,
			roomId : 0,
			character : 0,
			status : STATUS.IDLE,
			word : null,
			createdTime : Date.now()
		}
		;


	playersLCK.lockWrite(function(players) {
		players[playerId] = locker(playerId, player);

		playersLCK.unlockWrite(function() {
			callback(playerId);
		});
	});
}

exports.has = function(playerId, callback) {
	var that = this
		;

	playersLCK.lockRead(function(players) {
		var hasPlayer = !!players[playerId]
			;

		playersLCK.unlockRead(function() {
			callback(hasPlayer);
		});
	});
}

function _get(playerId, propNames, callback) {
	var that = this,
		players = playersLCK.getData(),
		playerLKC = players[playerId],
		propValues = []
		;

	if (!playerLKC) {
		callback.call(that, null);
		return;
	}

	if (propNames === '*') {
		playerLKC.lockRead(function(player) {
			playerLKC.unlockRead(function() {
				callback(Object.clone(player));
			})
		});
	} else {
		if (typeof propNames == 'string') {
			propNames = [propNames];
		}

		playerLKC.lockRead(function(player) {
			Object.each(propNames, function(name) {
				var value = Object.clone(player[name])
					;

				propValues.push(value);
			})

			playerLKC.unlockRead(function() {
				callback.apply(this, propValues);
			});
		});
	}
}

function _set(playerId, props, callback) {
	var that = this,
		players = playersLCK.getData(),
		playerLKC = players[playerId]
		;

	if (!playerLKC) {
		callback.call(that, null);
		return;
	}

	playerLKC.lockWrite(function(player) {
		Object.each(props, function(value, name) {
			player[name] = value;
		})

		playerLKC.unlockWrite(function() {
			callback();
		});
	});
}

exports.get = function(playerId, callback) {
	var that = this;

	_get.call(that, 
		playerId, 
		'*', 
		callback
	);
}


exports.isAdmin = function(playerId, callback) {
	var that = this
		;

	_get.call(that,
		playerId,
		'type',
		function (type) {
			callback(type === TYPE.ADMIN);
		}
	)
	
}

exports.getRoomId = function(playerId, callback) {
	var that = this;

	_get.call(that, 
		playerId, 
		'roomId', 
		callback
	);
}

exports.setRoomId = function(playerId, roomId, callback) {
	var that = this;

	_set.call(that, playerId, {
		roomId : roomId
	}, callback);
}

exports.getCharacter = function(playerId, callback) {
	var that = this;

	_get.call(that, 
		playerId, 
		'character', 
		callback
	);
}

exports.setCharacter = function(playerId, character, callback) {
	var that = this;

	_set.call(that, playerId, {
		character : character
	}, callback);
}

exports.getStatus = function(playerId, callback) {
	var that = this;

	_get.call(that, 
		playerId, 
		'status', 
		callback
	);
}

exports.setStatus = function(playerId, status, callback) {
	var that = this;

	_set.call(that, playerId, {
		status : status
	}, callback);
}

exports.getWord = function(playerId, callback) {
	var that = this;

	_get.call(that, 
		playerId, 
		'word', 
		callback
	);
}

exports.setWord = function(playerId, word, callback) {
	var that = this;

	_set.call(that, playerId, {
		word : word
	}, callback);
}

