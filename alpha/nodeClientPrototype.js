(function() {
	'use strict';

	var net = require('net');

	var socket = net.connect(10011, 'localhost');
	socket.setEncoding('utf8');

	var message = {
		data: "yo"
	};

	socket.on('data', function(data) {
		console.log(data); 
	});

	socket.write(JSON.stringify(message));

})();
