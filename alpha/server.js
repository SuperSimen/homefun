(function() {
	'use strict';

	var net = require('net');

	var socket = net.connect(10011, 'localhost');
	socket.setEncoding('utf8');


	function send(object) {
		socket.write(JSON.stringify(object) + "\n");
	}

	socket.on('data', function(data) {
		console.log(data); 
	});

	var register = {
		type: "register",
		networkName: "homefun",
		className: "client",
	};

	send(register);
	
	var subscribe = {
		type: "subscribe",
		subscribeTo: "presence",
	};

	send(subscribe);
	send(subscribe);

})();
