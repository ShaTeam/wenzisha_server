var Sequence = require('func-sequence'),
	players = require('../datas/players'),
	Result = require('./result')
	;

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

function getWord(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.getWord(playerId, function(word) {
		seq.next({
			word : word
		});
	});	
}

function getCharacter(data) {
	var seq = this,
		playerId = data.playerId
		;

	players.getCharacter(playerId, function(character) {
		seq.next({
			character : character
		});
	});	
}

/**
 * @query {string} playerId
 * @return {player : [object]}
 */
exports.get = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			playerId : query.playerId,
			player : null
		},
		seq
		;

	function done(data) {
		result.ok({
			player : data.player,
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasPlayer);

	seq.push(getPlayer);

	seq.push(seq.done);

	seq.next(data);
}


/**
 * @query {string} playerId
 * @return {word : [string], character : [number]}
 */
exports['get-puzzle'] = function(req, res) {
	var result = new Result(req, res),
		query = req.query,
		data = {
			playerId : query.playerId,
			playerStatus : players.STATUS.PUZZLE,
			word : '',
			character : players.CHARACTER.UNKOWN
		},
		seq
		;

	function done(data) {
		result.ok({
			word : data.word,
			character : data.character
		});
	}

	function exit(data) {
		var error = data.error;
		result[error]();
	}

	seq = new Sequence(done, exit);

	seq.push(checkIfHasPlayer);

	seq.push(getWord);

	seq.push(getCharacter);

	seq.push(seq.done);

	seq.next(data);
}