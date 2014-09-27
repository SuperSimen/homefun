(function() {
	'use strict';

	app.factory('devices', function($rootScope, socket) {

		var devices = {
			init: function() {
				socket.addHandler(presenceHandler, "presence");
				socket.subscribe("presence", "all", "");
			},
			list: [],
			fillList: function(list) {
				this.list.length = 0;
				for (var i in list) {
					this.list.push(list[i]);
				}
			},
		};

		function presenceHandler(data) {
			$rootScope.$apply(function() {
				devices.fillList(data.presence);
			});
		}

		return devices;

	});

	app.controller('deviceController', function($scope, devices) {
		$scope.devices = devices.list;

		var colorList = {};
		$scope.getColor = function(className) {
			if (!colorList[className]) {
				colorList[className] = Object.keys(colorList).length + 1;
			}
			return "color-" + colorList[className];
		};
	});
})();
