function test(num) {
	if (num < 1) {
		console.log('yes');
	} else {
		console.log('no');
		return
	}
	console.log('end');
	setTimeout(function() {
		console.log('timeout');
	}, 3000);
}

test(0);