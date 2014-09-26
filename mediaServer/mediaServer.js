(function() {
	'use strict';

	var net = require('net');
	var socket = net.connect(10011, 'localhost');

	var express = require('express');
	var app = express();

	app.use(express.static(__dirname + "/media"));

	app.listen(10013);

	var fs = require('fs');

	init();
	function init() {
		socket.setEncoding('utf8');

		socket.on('data', function(data) {
			onIncomingData(data);
		});
		
		register();

		fs.readdir('media', function(err, filesInput) {
			files = filesInput;
			publishFiles();
		});
	}

	var files;

	function send(object) {
		socket.write(JSON.stringify(object) + "\n");
	}

	function broadcastFiles() {
		var temp = {
			type: "broadcast",
			message: files,
		};

		send(temp);
	}
	function publishFiles() {
		var temp = {
			type: "publish",
			message: files,
		};

		send(temp);
	}

	function register() {
		var temp = {
			type: "register",
			networkName: "homefun",
			className: "mediaServer",
		};

		send(temp);
	}

	function onIncomingData(data) {

		var dataArray = data.split("\n");
		var message;
		for (var d = 0; d < dataArray.length; d++) {
			if (dataArray[d].length) {
				var parsingFailed = false;
				try {
					message = JSON.parse(dataArray[d]);
				}
				catch (e) {
					parsingFailed = true;
					console.error("parsing failed");
				}
				if (!parsingFailed) {
					handleData(message);
				}
			}
		}
	}

	function handleData(data) {
		if (data.type === "poll") {
			publishFiles();
		}
	}
})();
