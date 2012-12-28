var Sequence = require('func-sequence'),
	players = require('../datas/players'),
	puzzles = require('../datas/puzzles'),
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