var datas = require('../datas'),
	RES_CODE = {
		OK : 0,
		ERROR : 1
	},

	RES_REASON = {
		NO_ROOM : 1 << 0,
		NO_PLAYER : 1 << 1,
		FULL_ROOM : 1 << 2,
		UNKNOW : 1 << 10
	}
	;


function no_room_error(req, res) {
	res.json({
		code : RES_CODE.ERROR,
		reason : RES_REASON.NO_ROOM
	});
}

function full_room_error(req, res) {
	res.json({
		code : RES_CODE.ERROR,
		reason : RES_REASON.FULL_ROOM
	});
}

function no_player_error(req, res) {
	res.json({
		code : RES_CODE.ERROR,
		reason : RES_REASON.NO_PLAYER,
	});
}

/**
 * @query {number} playerCount
 * @return {roomId : [number], adminId : [nunber]}
 */
function openRoom(req, res) {
	var query = req.query,
		playerCount = query.playerCount,
		roomId, adminId, 
		startTimestamp, endTimestamp
		;

	startTimestamp = Date.now();

	function ok() {
		endTimestamp = Date.now();

		res.json({
			code : RES_CODE.OK,
			roomId : roomId,
			adminId : adminId,
			startTimestamp : startTimestamp,
			endTimestamp : endTimestamp
		});
	}

	datas.createRoom(playerCount, function(id) {
		roomId = id;

		datas.createPlayer(roomId, true, function(id) {
			adminId = id;
			ok();
		});
	});
}


/**
 * @query {number} roomId
 * @query {number=} playerId
 * @return {playerAmount : [number], playerId : [nunber], roomId : [number]}
 */
function joinRoom(req, res) {
	var query = req.query,
		roomId = query.roomId,
		playerId = query.playerId,
		playerAmount,
		startTimestamp, endTimestamp
		;

	startTimestamp = Date.now();

	function ok() {
		endTimestamp = Date.now();

		res.json({
			code : RES_CODE.OK,
			playerId : playerId,
			playerAmount : playerAmount,
			roomId : roomId,
			startTimestamp : startTimestamp,
			endTimestamp : endTimestamp
		});
	}

	datas.hasRoom(roomId, function(hasRoom) {
		if (hasRoom) {

			datas.isRoomFull(roomId, playerId, function(isFull) {
				if (isFull) {
					full_room_error(req, res);
				} else if (playerId) {
					datas.hasPlayer(playerId, function(hasPlayer) {
						if (hasPlayer) {
							datas.joinRoom(roomId, playerId, function(id, amount) {
								playerAmount = amount;
								ok();
							});
						} else {
							no_player_error(req, res);
						}
					});
				} else {
					datas.createPlayer(roomId, false, function(id, amount) {
						playerId = id;
						playerAmount = amount;
						ok();
					});
				}
			});
		} else {
			no_room_error(req, res);
		}
	})
}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {roomId : [number], 
 			playerCount : [number], 
 			status : [number], 
 			words : [Array], 
 			goodGuys : [number], 
			badGuys : [number],
			idiots : [number]
 			}
 */
function getRoom(req, res) {

}


/**
 * @query {number} roomId
 * @query {number} playerId
 * @return {players : [Array]}
 */
function getPalyers(req, res) {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {}
 */
function setPuzzle(req, res) {

}

/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {puzzle: [Array]}
 */
function randomPuzzle(req, res) {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {status: [number]}
 */
function startGame() {

}


/**
 * @query {number} roomId
 * @query {number} adminId
 * @return {status: [number]}
 */
function endGame() {

}

module.exports = {
	'open-room' : openRoom,
	'join-room' : joinRoom
}