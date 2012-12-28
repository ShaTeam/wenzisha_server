var Sequence = require('../src/sequence');

function done() {
	console.log('done');
}

function exit() {
	console.log('exit');
}

aSeq = new Sequence(done, exit);

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
})
.next({age : 28});