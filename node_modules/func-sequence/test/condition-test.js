var Sequence = require('../src/sequence');

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