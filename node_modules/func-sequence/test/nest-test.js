var Sequence = require('../src/sequence');

function done() {
	console.log('done');
}

function exit() {
	console.log('exit');
}

aSeq = new Sequence(done, exit);

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