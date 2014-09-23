(function() {
	'use strict';

	var net = require('net');

	var socket = net.connect(10011, 'localhost');
	socket.setEncoding('utf8');

	var message = {
		type: "register",
		networkName: "homefun",
		className: "client",
	};
	var message2 = {
		type: "register",
		networkName: "homefun",
		className: "server",
	};
	var message3 = {
		type: "register",
		networkName: "homefundo",
		className: "server",
	};

	socket.on('data', function(data) {
		console.log(data); 
	});

	socket.write(JSON.stringify(message) + "\n");
	socket.write(JSON.stringify(message2) + "\n");
	socket.write(JSON.stringify(message3) + "\n");

	socket.end();
})();
