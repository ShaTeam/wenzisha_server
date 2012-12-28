var Sequence = require('func-sequence'),
	rooms = require('../datas/rooms'),
	players = require('../datas/players'),
	puzzles = require('../datas/puzzles'),
	Result = require('./result')
	;

function random(len)  {
	return parseInt(parseInt(Math.random() * 1024) / 7) % len;
}


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
			playerAmount : playerAmount,
			playerStatus : players.STATUS.GAME
		});
	});
}

function exitRoom(data) {
	var seq = this,
		roomId = data.roomId,
		playerId = data.playerId
		;

	rooms.exit(roomId, playerId, function() {
		seq.next({
			roomId : 0,
			playerStatus : players.STATUS.IDLE
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
			seq.exit({error : 'no_permission_error'});
		} else {
			seq.next({
				playerCount : playerCount,
				playersRef : playersRef
			});
		}
	});
}

var checkIfHasPermission = getPlayersRef;

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

	rooms.setStatus(roomId, status, function() {
		seq.next();
	});
}

function setRoomWords(data) {
	var seq = this,
		roomId = data.roomId,
		words = data.words
		;

	rooms.setWords(roomId, words, function() {
		seq.next();
	});
}

function setRoomCharacters(data) {
	var seq = this,
		roomId = data.roomId,
		characters = data.characters
		;

	rooms.setCharacters(roomId, characters, function() {
		seq.next();
	});
}

function assignCharacter(data) {
	var seq = this,
		adminId = data.playerId,
		playersRef = data.playersRef.splice(0),
		playerCount = data.playerCount,
		characters = data.characters,
		words = data.words,
		rule = puzzles.rule(playerCount),
		playerRef, character, word,
		subSeq
		;

	Object.each(rule, function(count, character) {
		characters[character].count = count;
	})

	function done(data) {
		seq.next({
			characters : characters
		});
	}

	function pickPlayer() {
		if (!playersRef.length) return;

		var index = random(playersRef.length),
			playerRef = playersRef.splice(index, 1)
			;

		return playerRef;
	}

	function pickCharacter() {
		var characters = Object.keys(rule),
			index = random(characters.length),
			character = characters[index]
			;

		if (!(--rule[character])) {
			delete rule[character];
		}

		return character;
	}

	subSeq = new Sequence(done);

	while ((playerRef = pickPlayer())) {
		if (playerRef == adminId) {
			character = 'god';
		} else {
			character = pickCharacter();
		}

		characters[character].playersRef.push(playerRef);

		switch(character) {
			case 'people':
				word = words[0];
				break;
			case 'oni':
				word = words[0].length + '个字';
				break;
			case 'idiot':
				word = words[1];
				break;
			default:
				word = 'I\'m god';
				break;
		}

		subSeq.push(subSeq.next, {
			playerId : playerRef,
			character : character,
			word : word
		});
		subSeq.push(setPlayerCharacter);
		subSeq.push(setPlayerWord);
	}

	subSeq.push(subSeq.done);

	subSeq.next();

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
		playerId = data.playerId,
		playerStatus = data.playerStatus
		;

	players.setStatus(playerId, playerStatus, function() {
		seq.next();
	})
}

function setPlayerCharacter(data) {
	var seq = this,
		playerId = data.playerId,
		character = data.character
		;

	players.setCharacter(playerId, character, function() {
		seq.next();
	})
}

function setPlayerWord(data) {
	var seq = this,
		playerId = data.playerId,
		word = data.word
		;

	players.setWord(playerId, word, function() {
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
		index = random(words.length)
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
 * @query {string} playerId
 */
exports.exit = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.playerId
		},
		seq
		;

	function done(data) {
		result.ok();
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasRoom);

	seq.push(checkIfHasPermission);

	seq.push(exitRoom);

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

	function exit(data) {
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

	seq.push(checkIfHasPermission);

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

	seq.push(checkIfIsAdmin);

	seq.push(checkIfHasRoom);

	seq.push(checkIfHasPermission);

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

	seq.push(checkIfIsAdmin);

	seq.push(checkIfHasRoom);	

	seq.push(checkIfHasPermission);

	seq.push(getRandomPuzzle);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @query {string} words
 * @return {status: [number], characters: [object]}
 */
exports['start-game'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.adminId,
			words : query.words.split(','),
			characters : {
				god : {
					count : 0,
					playersRef : []
				},
				people : {
					count : 0,
					playersRef : []
				},
				oni : {
					count : 0,
					playersRef : []
				},
				idiot : {
					count : 0,
					playersRef : []
				}
			},
			status : rooms.STATUS.GAME
		},
		
		seq
		;

	function done(data) {
		result.ok({
			status : data.status,
			characters : data.characters
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfIsAdmin);

	seq.push(checkIfHasRoom);

	seq.push(getPlayersRef);

	seq.push(assignCharacter);

	seq.push(setRoomStatus);

	seq.push(setRoomWords);

	seq.push(setRoomCharacters);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {number} roomId
 * @query {string} adminId
 * @return {status: [number]}
 */
exports['end-game'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			roomId : query.roomId,
			playerId : query.adminId,
			words : null,
			character : null,
			status : rooms.STATUS.IDLE
		},
		seq
		;

	function done(data) {
		result.ok({
			status : data.status
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfIsAdmin);

	seq.push(checkIfHasRoom);

	seq.push(checkIfHasPermission);

	seq.push(setRoomStatus);

	seq.push(setRoomWords);
	
	seq.push(setRoomCharacters);

	seq.push(seq.done);

	seq.next(data);
}