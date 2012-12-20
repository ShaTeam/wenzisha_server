var Sequence = require('../libs/sequence'),
	rooms = require('../datas/rooms'),
	players = require('../datas/players'),
	Result = require('./result')
	;


function createRoom(data) {
	var seq = this,
		playerCount = data.playerCount
		;

	rooms.create(playerCount, function(roomId) {
		seq.next({
			roomId : roomId
		});
	});
}

function createPlayer(data) {
	var seq = this,
		isAdmin = data.isAdmin
		;

	players.create(isAdmin, function(playerId) {
		seq.next({
			playerId : playerId
		});
	});
}

function joinRoom(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.join(roomId, playerId, function(playerAmount) {
		seq.next({
			playerAmount : playerAmount
		});
	});
}

function setPlayerRoom(data) {
	var seq = this,
		playerId = data.playerId,
		roomId = data.roomId
		;

	players.setRoomId(playerId, roomId, function() {
		seq.next();
	});
}

function setPlayerStatus(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.setStatus(playerId, players.STATUS.GAME, function() {
		seq.next();
	})
}

function checkIfHasRoom(data) {
	var seq = this,
		roomId = data.roomId
		;

	rooms.has(roomId, function(hasRoom) {
		if (hasRoom) {
			seq.next();
		} else {
			seq.exit({error : 'no_room_error'});
		}
	});
}

function checkIfFullRoom(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.isFull(roomId, playerId, function(isFull) {
		if (isFull) {
			seq.exit({error : 'full_room_error'});				
		} else if (playerId){
			seq.next();
		} else {
			seq.nextElse();
		}
	});
}

function checkIfHasPlayer(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.has(playerId, function(hasPlayer) {
		if (hasPlayer) {
			seq.next();
		} else {
			seq.exit({error : 'no_player_error'});
		}
	});		
}

function checkIfIsAdmin(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.isAdmin(playerId, function(is) {
		if (is) {
			seq.next();
		} else {
			seq.exit({error : 'not_admin_error'});
		}
	});
}

function getPlayer(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.get(playerId, function(player) {
		seq.next({
			player : player
		});
	});
}

function getPlayers(data) {
	var seq = this,
		playerId = data.playerId,
		playersRef = data.playersRef,
		playerList = data.playerList,
		subSeq
		;

	if (playersRef.indexOf(playerId) < 0) {
		seq.exit({error : 'no_permission_error'});
	} else {
		function done(data) {
			seq.next({
				playerList : playerList
			})
		}

		subSeq = new Sequence(done);

		Object.each(playersRef, function(playerId, index) {
			subSeq.push(getPlayer, {playerId : playerId});

			subSeq.push(function(data) {
				playerList.push(data.player);
				subSeq.next();
			})
		});

		subSeq.push(subSeq.done);

		subSeq.next();
	}
}

function getPlayersRef(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.getPlayers(roomId, function(playerCount, playersRef) {
		if (playersRef.indexOf(playerId) < 0) {
			seq.exit('no_permission_error');
		} else {
			seq.next({
				playersRef : playersRef
			});
		}
	});
}

function getPlayerAmount(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.getPlayers(roomId, function(playerCount, playersRef) {
		if (playersRef.indexOf(playerId) < 0) {
			seq.exit('no_permission_error');
		} else {
			seq.next({
				playerAmount : playersRef.length
			});
		}
	});
}


/**
 * @query {number} playerCount
 * @query {string}
 * @return {roomId : [number], adminId : [nunber]}
 */
exports.open = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			playerCount : query.playerCount,
			isAdmin : true,
			roomId : null,
			playerId : null
		},
		seq
		;

	function done(data) {
		result.ok({
			roomId : data.roomId,
			adminId : data.playerId
		});
	}

	seq = new Sequence(done);

	seq.push(createRoom);

	seq.push(createPlayer);

	seq.push(joinRoom);

	seq.push(setPlayerRoom);

	seq.push(setPlayerStatus);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string=} playerId
 * @return {playerAmount : [number], playerId : [nunber], roomId : [number]}
 */
exports.join = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.playerId,
			playerAmount : null,
			isAdmin : false
		},
		seq
		;

	function done(data) {
		result.ok({
			playerAmount : data.playerAmount,
			playerId : data.playerId,
			roomId : data.roomId
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(checkIfFullRoom);

	seq.push(checkIfHasPlayer, createPlayer);

	seq.push(joinRoom);

	seq.push(setPlayerRoom);

	seq.push(setPlayerStatus);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {players : [Array]}
 */
exports['get-players'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.adminId,
			playerList : []
		},
		seq
		;

	function done(data) {
		result.ok({
			playerList : data.playerList
		});
	}

	function exit(error) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfIsAdmin);

	seq.push(checkIfHasRoom);

	seq.push(getPlayersRef);

	seq.push(getPlayers);

	seq.push(seq.done);

	seq.next(data);

}


/**
 * @query {number} roomId
 * @query {string} playerId
 * @return {playerAmount : [number]}
 */
exports['get-amount'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.playerId,
			playerAmount : null
		},
		seq
		;

	function done(data) {
		result.ok({
			playerAmount : data.playerAmount
		});
	}

	function exit(data) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(getPlayerAmount);

	seq.push(seq.done);

	seq.next(data);
}

/**
 * @query {number} roomId
 * @query {string} playerId
 * @return {playerAmount : [number]}
 */
exports['get-status'] = function(req, res) {

}

/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {}
 */
exports['get-puzzle'] = function(req, res) {

}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {puzzle: [Array]}
 */
exports['random-puzzle'] = function(req, res) {

}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {status: [number]}
 */
exports['start-game'] = function() {

}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {status: [number]}
 */
exports['end-game'] = function() {

}