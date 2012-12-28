var Sequence = require('../src/sequence');

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