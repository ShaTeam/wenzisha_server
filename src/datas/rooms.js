var ALIVE_TIME = 60 * 60 * 1000* 2,
	STATUS = {
		IDLE : 0,
		OPENED : 1,
		PUZZLE : 2,
		GAME : 3
	},
	LIMIT = 1024,

	locker = require('../libs/locker'),
	roomsLCK = locker('rooms')
	;

exports.STATUS = STATUS;


exports.create = function(playerCount, callback) {
	var that = this,
		room = {
			playerCount : playerCount,
			playersRef : [],
			status : STATUS.OPENED,
			words : null,
			characters : null,
			createdTime : Date.now()
		},
		roomId
		;

	roomsLCK.lockWrite(function(rooms){
		for (var i = 1; i <= LIMIT; i++) {
			roomId = '' + i;
			if (!rooms[roomId]) {
				room.id = roomId;
				rooms[roomId] = locker(roomId, room);
				break;
			}
		}

		roomsLCK.unlockWrite(function() {
			callback(roomId);
		});
	});
}

exports.has = function(roomId, callback) {
	var that = this
		;

	roomsLCK.lockRead(function(rooms) {
		var hasRoom = !!rooms[roomId]
			;

		roomsLCK.unlockRead(function() {
			callback(hasRoom);
		});
	});
}

exports.isFull = function(roomId, playerId, callback) {
	var that = this
		;

	if (arguments.length == 2) {
		callback = playerId;
		playerId = null;
	}

	that.getPlayers(roomId, function(playerCount, playersRef) {
		callback(playersRef.length >= playerCount && 
					(playerId ? playersRef.indexOf(playerId) < 0 : true));
	});
}

exports.join = function(roomId, playerId, callback) {
	var that = this,
		rooms = roomsLCK.getData(),
		roomLCK = rooms[roomId],
		playerAmount
		;

	roomLCK.lockWrite(function(room) {
		if (room.playersRef.indexOf(playerId) < 0) {
			room.playersRef.push(playerId);
		}

		playerAmount = room.playersRef.length;

		roomLCK.unlockWrite(function() {
			callback(playerAmount);
		});
	});
}

exports.exit = function(roomId, playerId, callback) {
	var that = this,
		rooms = roomsLCK.getData(),
		roomLCK = rooms[roomId]
		;

	roomLCK.lockWrite(function(room) {
		var index = room.playersRef.indexOf(playerId)
			;

		if (index > -1) {
			room.playersRef.splice(index, 1);
		}

		roomLCK.unlockWrite(function() {
			callback();
		});
	});
}


function _get(roomId, propNames, callback) {
	var that = this,
		rooms = roomsLCK.getData(),
		roomLCK = rooms[roomId],
		propValues = []
		;

	if (!roomsLCK) {
		callback.call(that, null);
		return;
	}


	if (propNames === '*') {
		roomLCK.lockRead(function(room) {
			roomLCK.unlockRead(function() {
				callback.call(that, Object.clone(room));
			})
		});
	} else {
		if (typeof propNames === 'string') {
			propNames = [propNames];
		}

		roomLCK.lockRead(function(room) {
			Object.each(propNames, function(name) {
				var value = Object.clone(room[name])
					;

				propValues.push(value);
			})

			roomLCK.unlockRead(function() {
				callback.apply(this, propValues);
			});
		});
	}
}

function _set(roomId, props, callback) {
	var that = this,
		rooms = roomsLCK.getData(),
		roomLCK = rooms[roomId]
		;

	if (!roomsLCK) {
		callback.call(that, null);
		return;
	}

	roomLCK.lockWrite(function(room) {
		Object.each(props, function(value, name) {
			room[name] = value;
		})

		roomLCK.unlockWrite(function() {
			callback();
		});
	});
}

exports.get = function(roomId, callback) {
	var that = this;

	_get.call(that, 
		roomId, 
		'*', 
		callback
	);
}


exports.getPlayers = function(roomId, callback) {
	var that = this;

	_get.call(that, 
		roomId, 
		['playerCount', 'playersRef'], 
		callback
	);
}

exports.setStatus = function(roomId, status, callback) {
	var that = this;

	_set.call(that, roomId, {
		status : status
	}, callback);
}

exports.getStatus = function(roomId, callback) {
	var that = this;

	_get.call(that, 
		roomId, 
		'status', 
		callback
	);
}

exports.setWords = function(roomId, words, callback) {
	var that = this;

	_set.call(that, roomId, {
		words : words
	}, callback);
}

exports.getWords = function(roomId, callback) {
	var that = this;

	_get.call(that, 
		roomId, 
		'words', 
		callback
	);
}

exports.setCharacters = function(roomId, characters, callback) {
	var that = this;

	_set.call(that, roomId, {
		characters : characters
	}, callback);
}

exports.getCharacters = function(roomId, callback) {
	var that = this;

	_get.call(that, 
		roomId, 
		'characters', 
		callback
	);
}