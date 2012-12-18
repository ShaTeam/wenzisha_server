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
		USER : 1
	}
	;

function createRoom(playerCount, callback) {
	var that = this,
		roomsLCK = that._rooms,
		room = {
			playerCount : playerCount,
			players : [],
			adminRef : null,
			status : 0,
			puzzle : [],
			createdTime : Date.now()
		},
		id
		;

	roomsLCK.lockWrite(function(rooms){
		for (var i = 1; i <= ROOM_LIMIT; i++) {
			id = 'room-' + i;
			if (!rooms[id]) {
				room.id = id;
				rooms[id] = locker(id, room);
				break;
			}
		}

		roomsLCK.unlockWrite(function() {
			callback(id);
		});
	});
}

function createAdmin(roomId, callback) {
	var that = this,
		rooms = that._rooms.getData(),
		roomLCK = rooms[roomId],
		playersLCK = that._players,
		id = uuid.create().toString(),
		player = {
			id : id,
			type : PLAYER_TYPE.ADMIN,
			createdTime : Date.now()
		}
		;


	roomLCK.lockWrite(function(room) {
		room.adminRef = id;

		roomLCK.unlockWrite(function() {
			playersLCK.lockWrite(function(players) {
				players[id] = locker(id, player);

				playersLCK.unlockWrite(function() {
					callback(id);
				});
			});
		});
	});
}

function _create() {
	return {
		createRoom : createRoom,
		createAdmin : createAdmin,
		_rooms : locker('rooms'),

		_players : locker('players'),

		_puzzles : puzzles,

		create : _create
	}
}

module.exports = _create();