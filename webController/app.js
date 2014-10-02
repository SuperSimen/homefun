var app = angular.module('app', ['ui.router', 'coral']);

(function() {
	'use strict';

	app.controller('appController', function($scope, $state) {
		$scope.goTo = function(state) {
			$state.go(state);
		};
		$scope.isActive = function(state) {
			return state === $state.current.name;
		};

	});

	app.filter('array', function() {
		return function(arrayLength) {
			arrayLength = Math.ceil(arrayLength);
			var arr = new Array(arrayLength), i = 0;
			for (; i < arrayLength; i++) {
				arr[i] = i;
			}
			return arr;
		};
	});

	app.config( function ( $stateProvider) {
		$stateProvider.state('baseDevices', {
			controller: "deviceController",
			templateUrl: "views/devices/deviceView.tpl.html"
		}).state('devices', {
			parent: 'baseDevices',
			controller: "mediaController",
			templateUrl: "views/media/mediaView.tpl.html"
		}).state('media', {
			controller: "mediaController",
			templateUrl: "views/media/mediaView.tpl.html"
		}).state('playing', {
			controller: "mediaController",
			templateUrl: "views/media/playingView.tpl.html"
		});
	});

	app.run( function (coral, constants, $state, devices, media, $http) {
		coral.connect(constants, function() {
			devices.init();
			media.init();
		});
		$state.go("devices");
	});

	app.factory('constants', function() {
		return {
			networkName: "homefun",
			className: "webController",
			webSocketUrl: "ws://192.168.1.128:10012",
		};

	});

})();
