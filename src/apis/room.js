var datas = require('../datas')
	;

/**
 * @query {number} playerCount
 * @return {roomId : [number], adminId : [nunber]}
 */
function openRoom(req, res) {
	
}


/**
 * @query {number} roomId
 * @return {playerCount : [number], palyerId : [nunber]}
 */
function joinRoom(req, res) {

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
	'open-room' : openRoom
}