(function() {
	'use strict';

	var net = require('net');
	var fs = require('fs');
	var express = require('express');
	var chokidar = require('chokidar');

	var coralServer = parseConfigFile('../config.js');
	var socket = net.connect(coralServer.port, coralServer.ip);

	var app = express();
	app.use(express.static(__dirname + "/media"));

	var port = 10014;
	var myIp;
	var files = [];

	app.listen(port);

	init();
	function init() {
		socket.setEncoding('utf8');

		socket.on('data', function(data) {
			onIncomingData(data);
		});


		register();

		var watcher = chokidar.watch('media', {ignored: /^\./, persistent: true});
		function getFileName(path) {
			return path.substring(path.lastIndexOf('/') + 1);
		}

		watcher.on('add', function(path) {
			var filename = getFileName(path);
			if (filename.charAt(0) !== '.') {
				files.push(getFileName(path));
				publishFiles();
			}
		});
		watcher.on('unlink', function(path) {
			var filename = getFileName(path);
			files.splice(files.indexOf(getFileName(path)),1);
			publishFiles();
		});
		
	}

	function parseConfigFile(filename) {
		var file = fs.readFileSync(filename, {encoding: 'utf8'});
		var coralServer = {};
		var coralConfig = file.substr(file.indexOf('config.coralServer'));

		temp = coralConfig;
		temp = temp.substr(temp.indexOf('ip'));
		temp = temp.substr(temp.indexOf('"') + 1);
		temp = temp.substr(0, temp.indexOf('"'));
		coralServer.ip = temp;

		temp = coralConfig;
		temp = temp.substr(temp.indexOf('socketPort'));
		temp = temp.substr(temp.indexOf('"') + 1);
		temp = temp.substr(0, temp.indexOf('"'));
		coralServer.port = temp;
		return coralServer;
	}


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
		if (!myIp) {
			return console.error("not correctly registered");
		}
		var message = {
			files: files,
			path: "http://" + myIp + ":" + port,
		};

		send({
			type: "publish",
			message: message
		});
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
		else if (data.type === "server_ack") {
			if (data.value === "register") {
				myIp = data.yourIp;
				publishFiles();
			}
		}
	}
})();
