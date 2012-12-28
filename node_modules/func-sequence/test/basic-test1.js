var Sequence = require('../src/sequence');

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
		aSeq.exit(); // aSeq.next();
	}, 400);
}).push(function() {
	setTimeout(function() {
		console.log(2);
		aSeq.next();
	}, 100);
}).push(aSeq.done).next();