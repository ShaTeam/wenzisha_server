var uuid = require('uuid-js'),

	locker = require('./locker'),
	puzzles = require('./puzzles'),

	ROOM_ALIVE_TIME = 60 * 60 * 1000* 2,
	ROOM_STATUS = {

	},
	ROOM_LIMIT = 1024,

	PLAYER_ALIVE_TIME = 24 * 60 * 60 * 1000 * 2,
	PLAYER_TYPE = {
		ADMIN : 0,
		NOT_AMDIN : 1
	}
	;

function createRoom(playerCount, callback) {
	var that = this,
		roomsLCK = that._rooms,
		room = {
			playerCount : playerCount,
			playersRef : [],
			status : 0,
			puzzle : [],
			createdTime : Date.now()
		},
		roomId
		;

	roomsLCK.lockWrite(function(rooms){
		for (var i = 1; i <= ROOM_LIMIT; i++) {
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

function hasRoom(roomId, callback) {
	var that = this,
		roomsLCK = that._rooms
		;

	roomsLCK.lockRead(function(rooms) {
		var hasRoom = !!rooms[roomId]
			;

		roomsLCK.unlockRead(function() {
			callback(hasRoom);
		});
	});
}

function getRoomPlayers(roomId, callback) {
	var that = this,
		rooms = that._rooms.getData(),
		roomLCK = rooms[roomId],
		playerCount,
		playerAmount
		;

	roomLCK.lockRead(function(room) {
		playerCount = room.playerCount;
		playersRef = room.playersRef.slice();

		roomLCK.unlockRead(function() {
			callback(playerCount, playersRef);
		});
	});
}

function isRoomFull(roomId, playerId, callback) {
	var that = this
		;

	that.getRoomPlayers(roomId, function(playerCount, playersRef) {
		callback(playersRef.length >= playerCount && 
					playersRef.indexOf(playerId) < 0);
	});
}

function joinRoom(roomId, playerId, isAdmin, callback) {
	var that = this,
		rooms = that._rooms.getData(),
		roomLCK = rooms[roomId],
		playerAmount
		;

		if (arguments.length === 3) {
			callback = isAdmin;
			isAdmin = false;
		}

		roomLCK.lockWrite(function(room) {
			if (room.playersRef.indexOf(playerId) < 0) {
				room.playersRef.push(playerId);
			}

			playerAmount = room.playersRef.length;

			roomLCK.unlockWrite(function() {
				callback(playerId, playerAmount);
			});
		});
}

function createPlayer(roomId, isAdmin, callback) {
	var that = this,
		playersLCK = that._players,
		playerId = uuid.create().toString(),
		player = {
			id : playerId,
			type : isAdmin ? PLAYER_TYPE.ADMIN : PLAYER_TYPE.NOT_AMDIN,
			createdTime : Date.now()
		}
		;


	playersLCK.lockWrite(function(players) {
		players[playerId] = locker(playerId, player);

		playersLCK.unlockWrite(function() {
			that.joinRoom(roomId, playerId, isAdmin, callback);
		});
	});
}

function hasPlayer(playerId, callback) {
	var that = this,
		playersLCK = that._players
		;

	playersLCK.lockRead(function(players) {
		var hasPlayer = !!players[playerId]
			;

		playersLCK.unlockRead(function() {
			callback(hasPlayer);
		});
	});
}

function _create() {
	return {
		createRoom : createRoom,
		hasRoom : hasRoom,
		isRoomFull : isRoomFull,
		joinRoom : joinRoom,
		getRoomPlayers : getRoomPlayers,
		_rooms : locker('rooms'),

		createPlayer : createPlayer,
		hasPlayer : hasPlayer,
		_players : locker('players'),

		_puzzles : puzzles,

		create : _create
	}
}

module.exports = _create();