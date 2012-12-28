# 异步函数队列

可为各种异步函数建立起一个顺序的执行队列

## 基本使用

一个利用队列，把异步函数，顺序执行的例子：

	var Sequence = require('func-sequence');

	aSeq = new Sequence();

	aSeq.push(function() {
		setTimeout(function() {
			console.log(1);
			aSeq.next();
		}, 400);
	}).push(function() {
		setTimeout(function() {
			console.log(2);
			aSeq.next();
		}, 100);
	}).next();

输出：

	> 1
	> 2

通过调用done或exit函数，可以中断队列的执行：

	var Sequence = require('func-sequence');

	function done() {
		console.log('done');
	}

	function exit() {
		console.log('exit');
	}

	aSeq = new Sequence(done, exit);

	aSeq.push(function() {
		setTimeout(function() {
			console.log(1);
			aSeq.done(); // aSeq.exit();
		}, 400);
	}).push(function() {
		setTimeout(function() {
			console.log(2);
			aSeq.next();
		}, 100);
	}).next();

输出：

	> 1
	> done

也可以把aSeq.done或aSeq.exit函数给push到队列中去：

	var Sequence = require('func-sequence');

	function done() {
		console.log('done');
	}

	function exit() {
		console.log('exit');
	}

	aSeq = new Sequence(done, exit);

	aSeq.push(function() {
		setTimeout(function() {
			console.log(1);
			aSeq.next();
		}, 400);
	}).push(function() {
		setTimeout(function() {
			console.log(2);
			aSeq.next();
		}, 100);
	}).push(aSeq.done).next();

输出：

	> 1
	> 2
	> done

## 传递数据

sequence对象有个data属性，可以保存需要用到的数据，并在被执行的函数中使用。传递数据的方式有如下几种：

* aSeq.push(func, data)
* aSeq.next(data)
* aSeq.nextElse(data)
* aSeq.done(data)
* aSeq.exit(data)

在每个被执行的函数中，data会作为第一个参数被传递进来，同时，被执行函数的上下文，即为当前的sequence对象：

	aSeq.push(function(data) {
		console.log(data);
		this.next();
	});

## 条件执行

当一个函数内，需要经过条件判断，以便执行调用的函数时，可以用到funcElse和nextElse，例子如下：


	var Sequence = require('func-sequence');

	function done() {
		console.log('done');
	}

	function exit() {
		console.log('exit');
	}

	aSeq = new Sequence(done, exit);

	aSeq.push(function(data) {
		if (data.age > 18) {
			this.next();
		} else {
			this.nextElse();
		}
	}).push(
		function() {
			console.log('so sexy!');
			this.done();
		}, 
		function() {
			console.log('only for adult!')
			this.exit();
		}
	)
	.next({age : 28});

输出：

	> so sexy!
	> done

还可以这样来设置条件函数：

	aSeq.push({
		func : function() {
			console.log('so sexy!');
			this.done();
		},
		funcElse : function() {
			console.log('only for adult!')
			this.exit();
		},
		condition : function(data) {
			return data.age > 18;
		}
	});

## 队列嵌套

在一些复杂的异步逻辑中（比如异步循环套异步循环），就有可能需要用到队列的嵌套。嵌套规则其实很简单，只需要在需要被执行的函数中，再新建一个sequence对象即可：

	var Sequence = require('func-sequence');

	function done() {
		console.log('done');
	}
	
	aSeq = new Sequence(done);
	
	aSeq.push(function() {
		var aSeq = this;
		setTimeout(function() {
			console.log(1);
			aSeq.next();
		}, 400);
	}).push(function() {
		var aSeq = this
			;
	
		function subDone() {
			aSeq.next();
		}
	
		var subSeq = new Sequence(subDone);
	
		subSeq.push(function() {
			var subSeq = this
				;
	
			setTimeout(function() {
				console.log('1-1');
				subSeq.next();
			}, 300);
		}).push(function() {
			var subSeq = this
				;
	
			setTimeout(function() {
				console.log('1-2');
				subSeq.next();
			}, 200);
		}).push(subSeq.done).next();
		
	}).push(function() {
		var aSeq = this;
		setTimeout(function() {
			console.log(2);
			aSeq.next();
		}, 100);
	}).push(aSeq.done).next();


输出：
	
	> 1
	> 1-1
	> 1-2
	> 2
	> done

## 一些技巧和注意

* next, done, exit都可以作为被执行函数push到队列中。
* 条件函数不能产生无限分支。
* 可以定义一些公用的异步调用，但在各种情况下，执行的顺序不同。

## 完整API参考

### Sequence([done[, exit]])

* @param {function=} done
* @param {function=} exit

构造函数

### push(func)

* @param {function} func

### push(func, funcElse)

* @param {function} func
* @param {function} funcElse

### push(func, data)

* @param {function} func
* @param {object} data

### push(func, funcElse, data)

* @param {function} func
* @param {function} funcElse
* @param {object} data

### push(opt)

* @param {object} opt
	* @key {function} func
	* @key {function} funcElse
	* @key {object} data
	* @key {function|*} condition

把被执行函数加入到队列中

### next([data])

* @param {object=} data

执行队列中的下一个函数

### nextElse([data])

* @param {object=} data

执行队列中的下一个else函数（如果设置了funcElse）

### done([data])

* @param {object=} data

完成队列调用，并清空队列

### exit([data])

* @param {object=} data

退出队列调用，并清空队列
	


