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
* @query {string=} adminId
* @return
	* @param {number} roomId
	* @param {string} adminId

新开房间，如果不提供adminId，则创建一个管理员

### rooms/join

* @query {number} roomId
* @query {string=} playerId
* @return
	* @param {number} roomId
	* @param {string} playerId
	* @param {number} playerAmount

加入房间，如不提供playerId，则创建一个玩家，并返回房间的当前人数

### rooms/get-players

* @query {number} roomId
* @query {string} adminId
* @return
	* @param {Array} playerList

（管理员权限）获取房间的玩家列表

### rooms/get-amount

* @query {number} roomId
* @query {string} playerId
* @return
	* @param {number} playerAmount

获取房间的玩家数

### rooms/get-status

* @query {number} roomId
* @query {string} playerId
* @return
	* @param {number} status

获取房间的状态

### rooms/set-status

* @query {number} roomId
* @query {string} adminId
* @query {status} status

（管理员权限）设置房间的状态

### rooms/random-puzzle

* @query {number} roomId
* @query {string} adminId
* @return 
	* {Array} words

（管理员权限）设置房间的状态

### rooms/start-game

* @query {number} roomId
* @query {string} adminId
* @query {string} words
* @return 
	* {number} status
	* {object} characters

（管理员权限）开始游戏

### rooms/end-game

* @query {number} roomId
* @query {string} adminId
* @return 
	* {number} status

（管理员权限）结束游戏
