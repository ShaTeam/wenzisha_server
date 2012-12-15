var puzzles = require('./puzzles')
	;

function __create() {
	return {
		_rooms : {},
		_players : {},
		_puzzles : puzzles,
		__create : __create
	}
}

module.exports = __create();