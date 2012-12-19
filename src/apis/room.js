var Sequence = require('../libs/sequence'),
	rooms = require('../datas/rooms'),
	players = require('../datas/players'),
	Result = require('./result')
	;

/**
 * @query {number} playerCount
 * @return {roomId : [number], adminId : [nunber]}
 */
exports.open = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		playerCount = query.playerCount,
		roomId, adminId,
		seq
		;

	function done() {
		result.ok({
			roomId : roomId,
			adminId : adminId
		});
	}

	seq = new Sequence(done);

	seq.push(function craeteRoom() {
		rooms.create(playerCount, function(id) {
			roomId = id;

			seq.next();
		});
	});

	seq.push(function createPlayer() {
		players.create(true, function(id) {
			adminId = id;

			seq.next();
		});
	});

	seq.push(function joinRoom() {
		rooms.join(roomId, adminId, function() {
			seq.next();
		});
	});

	seq.push(function setPlayerRoom() {
		players.setRoomId(adminId, roomId, function() {
			seq.next();
		});
	});

	seq.push(function setPlayerStatus() {
		players.setStatus(adminId, players.STATUS.GAME, function() {
			seq.done();
		})
	});

	seq.next();
}


/**
 * @query {number} roomId
 * @query {number=} playerId
 * @return {playerAmount : [number], playerId : [nunber], roomId : [number]}
 */
exports.join = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		roomId = query.roomId,
		playerId = query.playerId,
		playerAmount,
		seq
		;

	function done() {
		result.ok({
			playerId : playerId,
			playerAmount : playerAmount,
			roomId : roomId
		});
	}

	function exit(errorName) {
		result[errorName]();
	}

	seq = new Sequence(done, exit);

	seq.push(function checkIfHasRoom() {
		rooms.has(roomId, function(hasRoom) {
			if (hasRoom) {
				seq.next();
			} else {
				seq.exit('no_room_error');
			}
		});
	});

	seq.push(function checkIfFullRoom() {
		rooms.isFull(roomId, playerId, function(isFull) {
			if (isFull) {
				seq.exit('full_room_error');				
			} else if (playerId){
				seq.next();
			} else {
				seq.nextElse();
			}
		});
	});

	seq.push(function checkIfHasPlayer() {
		players.has(playerId, function(hasPlayer) {
			if (hasPlayer) {
				seq.next();
			} else {
				seq.exit('no_player_error');
			}
		});		
	}, function createPlayer() {
		players.create(false, function(id) {
			playerId = id;

			seq.next();
		});		
	});

	seq.push(function joinRoom() {
		rooms.join(roomId, playerId, function(amount) {
			playerAmount = amount;
			
			seq.next();		
		});
	});

	seq.push(function setPlayerRoom() {
		players.setRoomId(playerId, roomId, function() {
			seq.next();
		});
	});

	seq.push(function setPlayerStatus() {
		players.setStatus(playerId, players.STATUS.GAME, function() {
			seq.done();
		})
	});

	seq.next();
}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {players : [Array]}
 */
exports['get'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		roomId = query.roomId,
		adminId = query.adminId,
		room,
		seq
		;

	function done() {
		result.ok(room);
	}

	function exit(errorName) {
		result[errorName]();
	}

	seq = new Sequence(done, exit);

	seq.push(function checkIfIsAdmin() {
		players.isAdmin(adminId, function(is) {
			if (is) {
				seq.next();
			} else {
				seq.exit('not_admin_error');
			}
		});
	});

	seq.push(function checkIfHasRoom() {
		rooms.has(roomId, function(hasRoom) {
			if (hasRoom) {
				seq.next();
			} else {
				seq.exit('no_room_error');
			}
		});
	});

	seq.push(function getPlayers() {
		rooms.get(roomId, function(_room) {
			var playersRef = _room.playersRef,
				playerList = _room.playerList = [];

			room = _room;
			room.playerList = [];

			if (playersRef.indexOf(adminId) < 0) {
				seq.exit('no_permission_error');
			} else {
				Object.each(playersRef, function(playerId, index) {
					seq.push(function () {
						players.get(playerId, function(player) {
							playerList.push(player);

							if (index < playersRef.length - 1) {
								seq.next();
							} else {
								seq.done();
							}
						});
					});
				});

				seq.next();
			}
		});
	});

	seq.next();

}


/**
 * @query {number} roomId
 * @query {number} playerId
 * @return {playerAmount : [number]}
 */
exports['get-amount'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		roomId = query.roomId,
		playerId = query.playerId,
		playerAmount,
		seq
		;

	function done() {
		result.ok({
			playerAmount : playerAmount
		});
	}

	function exit(errorName) {
		result[errorName]();
	}

	seq = new Sequence(done, exit);

	seq.push(function checkIfHasRoom() {
		rooms.has(roomId, function(hasRoom) {
			if (hasRoom) {
				seq.next();
			} else {
				seq.exit('no_room_error');
			}
		});
	});

	seq.push(function getPlayerAmount() {
		rooms.getPlayers(roomId, function(playerCount, playersRef) {
			if (playersRef.indexOf(playerId) < 0) {
				seq.exit('no_permission_error');
			} else {
				playerAmount = playersRef.length;
				seq.done();
			}
		});
	});

	seq.next();
}

/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {}
 */
exports['get-puzzle'] = function(req, res) {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {}
 */
exports['set-puzzle'] = function(req, res) {

}

/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {puzzle: [Array]}
 */
exports['random-puzzle'] = function(req, res) {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {status: [number]}
 */
exports['start-game'] = function() {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {status: [number]}
 */
exports['end-game'] = function() {

}