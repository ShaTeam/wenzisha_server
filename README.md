# 文字杀服务端接口描述

* 接口返回格式：JSON字符串。当返回结果正确时，code字段为0，否则为1并追加reason字段。
* reason字段定义：
	* 1 - 没有roomId所指的房间
	* 2 - 没有playerId所指的玩家
	* 4 - 房间已满
	* 8 - 当前playerId指向的不是管理员
	* 16 - 当前playerId没有权限（不是Room的成员）
	* 1024 - 未知错误


## 房间相关接口

### STATUS
	
* 0 - IDLE
* 1 - OPENED
* 2 - PUZZLE
* 3 - GAME

### rooms/open

* @query {number} playerCount
* @return
	* @param {number} roomId
	* @param {string} adminId

新开房间

### rooms/join

* @query {number} roomId
* @query {string=} playerId
* @return
	* @param {number} roomId
	* @param {number} playerId
	* @param {number} playerAmount

加入房间

### rooms/get-players

* @query {number} roomId
* @query {string} adminId
* @return
	* @param {Array} playerList

获取房间的加入人数

### rooms/get-amount

* @query {number} roomId
* @query {string} playerId
* @return
	* @param {number} playerAmount

获取房间的加入人数
