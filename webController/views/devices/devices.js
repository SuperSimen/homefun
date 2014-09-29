(function() {

	'use strict';

	app.factory('devices', function($rootScope, socket) {

		var devices = {
			init: function() {
				socket.addHandler(presenceHandler, "presence");
				socket.addHandler(messageHandler, "message");
				socket.subscribe("presence", "all", "");

			},
			list: [],
			get: function(id) {
				for (var i = 0; i < this.list.length; i++) {
					if (this.list[i].id === id) {
						return this.list[i];
					}
				}
			},
			findById: function(list, id) {
				for (var i = 0; i < list.length; i++) {
					if (list[i].id === id) {
						return true;
					}
				}
				return false;
			},
			updateDevices: function(deviceList) {
				for (var i = 0; i < deviceList.length; i++) {
					if (!this.findById(this.list, deviceList[i].id)) {
						this.list.push(deviceList[i]);
					}
				}
				var deleteThese = [];
				for (i = 0; i < this.list.length; i++) {
					if (!this.findById(deviceList, this.list[i].id)) {
						deleteThese.push(this.list[i]);
					}
				}
				for (i = 0; i < deleteThese.length; i++) {
					this.list.splice(this.list.indexOf(deleteThese[i]),1);
				}
			}
		};

		function presenceHandler(data) {
			$rootScope.$apply(function() {
				devices.updateDevices(data.presence);
			});
		}

		function messageHandler(data) {
			console.log(data);
			var message = data.message;
			$rootScope.$apply(function() {
				if (message.status === "playing" || message.status === "stopped" || message.status === "paused") {
					devices.get(data.fromId).status = message.status;
				}
			});
		}

		return devices;

	});

	app.controller('deviceController', function($scope, devices, socket) {
		$scope.devices = devices.list;

		var colorList = {};
		$scope.getClass = function(device) {
			var classString = "";
			if (device.className === "webClient") {
				classString += ' pointer';
				if ($scope.activeDevice === device) {
					classString += ' active';
					return classString;
				}
			}

			var className = device.className;

			if (!colorList[className]) {
				colorList[className] = Object.keys(colorList).length + 1;
			}
			classString += " color-" + colorList[className];

			return classString;
		};

		$scope.clickOnDevice = function(device) {
			if (device.className === "webClient") {
				if ($scope.activeDevice === device) {
					$scope.activeDevice = null;
				}
				else {
					$scope.activeDevice = device;
				}
			}
		};

		$scope.showMedia = function(row) {
			if ($scope.activeDevice && $scope.activeDevice.className === 'webClient') {
				var activeRow = Math.floor(devices.list.indexOf($scope.activeDevice) / 4);
				return activeRow === row;
			}
			else {
				return false;
			}
		};

		$scope.showControl = function(control) {
			if (!$scope.activeDevice) {
				return false;
			}
			else if (control === 'play') {
				return false;
			}
			else if (control === 'pause') {
				return false;
			}
			else if (control === 'stop') {
				console.log($scope.activeDevice);
				return $scope.activeDevice.status === "playing";
			}
			else {
				return false;
			}
		};

		$scope.control = function(command, media) {
			if (!$scope.activeDevice) {
				return console.error("cannot control nonexistant device");
			}
			var message = {
				type: command
			};
			if (media) {
				message.title = media.title;
				message.path = media.path.$$unwrapTrustedValue();
			}
			socket.sendMessage(message, $scope.activeDevice.id);
		};
	});
})();
