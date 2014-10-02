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


	app.config( function ( $stateProvider) {
		$stateProvider.state('player', {
			controller: "playerController",
			templateUrl: "views/player/playerView.tpl.html"
		}).state('welcome', {
			controller: "welcomeController",
			templateUrl: "views/welcome/welcomeView.tpl.html"
		});
	});

	app.run( function ($state, player, welcome, constants, coral) {
		coral.connect(constants, function() {
			welcome.init();
			player.init();
		});
		$state.go("welcome");
	});

	app.factory('constants', function() {
		return {
			networkName: "homefun",
			className: "webClient",
			webSocketUrl: "ws://192.168.1.128:10012",
		};

	});

})();
