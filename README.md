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

### room/open

* @query {number} playerCount
* @query {string=} adminId
* @return
	* @param {number} roomId
	* @param {string} adminId

新开房间，如果不提供adminId，则创建一个管理员

### room/join

* @query {number} roomId
* @query {string=} playerId
* @return
	* @param {number} roomId
	* @param {string} playerId
	* @param {number} playerAmount

加入房间，如不提供playerId，则创建一个玩家，并返回房间的当前人数

### room/get-players

* @query {number} roomId
* @query {string} adminId
* @return
	* @param {Array} playerList

（管理员权限）获取房间的玩家列表

### room/get-amount

* @query {number} roomId
* @query {string} playerId
* @return
	* @param {number} playerAmount

获取房间的玩家数

### room/get-status

* @query {number} roomId
* @query {string} playerId
* @return
	* @param {number} status

获取房间的状态

### room/set-status

* @query {number} roomId
* @query {string} adminId
* @query {status} status

（管理员权限）设置房间的状态

### room/random-puzzle

* @query {number} roomId
* @query {string} adminId
* @return 
	* {Array} words

（管理员权限）设置房间的状态

### room/start-game

* @query {number} roomId
* @query {string} adminId
* @query {string} words
* @return 
	* {number} status
	* {object} characters

（管理员权限）开始游戏

### room/end-game

* @query {number} roomId
* @query {string} adminId
* @return 
	* {number} status

（管理员权限）结束游戏

##  玩家相关接口

### TYPE

* 0 - ADMIN
* 1 - NOT_AMDIN

### CHARACTER

* 1 - GOD
* 2 - PEOPLE
* 3 - ONI
* 4 - IDIOT

###	STATUS

* 0 - IDLE
* 1 - GAME

### player/get

* @query {string} playerId
* @return
	* @param {object} player

获取玩家信息
