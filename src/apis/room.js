var Sequence = require('../libs/sequence'),
	rooms = require('../datas/rooms'),
	players = require('../datas/players'),
	puzzles = require('../datas/puzzles'),
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
		} else {
			seq.next();
		}
	});
}

function getPlayersRef(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.getPlayers(roomId, function(playerCount, playersRef) {
		if (playerId && playersRef.indexOf(playerId) < 0) {
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
		playersRef = data.playersRef
		;

	seq.next({
		playerAmount : playersRef.length
	});
}

function getRoomStatus(data) {
	var seq = this,
		roomId = data.roomId
		;

	rooms.getStatus(roomId, function(status) {
		seq.next({
			status : status
		});
	});
}

function setRoomStatus(data) {
	var seq = this,
		roomId = data.roomId,
		status = data.status
		;

	rooms.setStatus(roomId, status, function(status) {
		seq.next();
	});
}

function getPlayers(data) {
	var seq = this,
		playerId = data.playerId,
		playersRef = data.playersRef,
		playerList = data.playerList,
		subSeq
		;

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

function getRandomPuzzle() {
	var seq = this,
		words = puzzles.words,
		wordsLen = words.length,
		index = parseInt(parseInt(Math.random() * 1024) / 7) % wordsLen
		;

	seq.next({words : words[index]});
}


/**
 * @query {number} playerCount
 * @query {string=} adminId
 * @query {string}
 * @return {roomId : [number], adminId : [string]}
 */
exports.open = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			playerCount : query.playerCount,
			playerId : query.adminId,
			isAdmin : true,
			roomId : null,
		},
		seq
		;

	function done(data) {
		result.ok({
			roomId : parseInt(data.roomId),
			adminId : data.playerId
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push({
		func : checkIfHasPlayer, 
		funcElse : createPlayer,
		condition : !!data.playerId
	});

	seq.push(createRoom);

	seq.push(joinRoom);

	seq.push(setPlayerRoom);

	seq.push(setPlayerStatus);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string=} playerId
 * @return {playerAmount : [number], playerId : [string], roomId : [string]}
 */
exports.join = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : parseInt(query.roomId),
			playerId : query.playerId,
			playerAmount : null,
			isAdmin : false
		},
		seq
		;

	function done(data) {
		result.ok({
			playerAmount : parseInt(data.playerAmount),
			playerId : data.playerId,
			roomId : parseInt(data.roomId)
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(checkIfFullRoom);

	seq.push({
		func : checkIfHasPlayer,
		funcElse : createPlayer,
		condition : !!data.playerId
	});

	seq.push(joinRoom);

	seq.push(setPlayerRoom);

	seq.push(setPlayerStatus);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {playerList : [Array]}
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
			playerAmount : parseInt(data.playerAmount)
		});
	}

	function exit(data) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(getPlayersRef);

	seq.push(getPlayerAmount);

	seq.push(seq.done);

	seq.next(data);
}

/**
 * @query {number} roomId
 * @query {string} playerId
 * @return {status : [number]}
 */
exports['get-status'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.playerId,
			status : null
		},
		seq
		;

	function done(data) {
		result.ok({
			status : parseInt(data.status)
		});
	}

	function exit(data) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(getRoomStatus);

	seq.push(seq.done);

	seq.next(data);
}

/**
 * @query {number} roomId
 * @query {string} adminId
 * @query {number} status
 * @return {}
 */
exports['set-status'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.adminId,
			status : query.status
		},
		seq
		;

	function done(data) {
		result.ok();
	}

	function exit(data) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(checkIfIsAdmin);

	seq.push(setRoomStatus);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {words: [Array]}
 */
exports['random-puzzle'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.adminId
		},
		seq
		;

	function done(data) {
		result.ok({
			words : data.words
		});
	}

	function exit(data) {
		var error = data.error
			;

		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(checkIfIsAdmin);

	seq.push(getRandomPuzzle);

	seq.push(seq.done);

	seq.next(data);
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

/**
 * @query {number} roomId
 * @query {string} playerId
 */
exports['exit'] = function() {

}