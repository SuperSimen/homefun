(function() {
	'use strict';

	var net = require('net');

	var socket = net.connect(10011, 'localhost');
	socket.setEncoding('utf8');

	socket.on('data', function(data) {
		console.log(data);
	});

	socket.write('Hello from node.js');

	socket.end();
})();
