var app = angular.module('app', ['ui.router', 'coral', 'config']);

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
		$state.go("welcome");
		welcome.init();
		player.init();
	});

	app.factory('constants', function(config) {
		return {
			networkName: "homefun",
			className: "webClient",
			webSocketUrl: config.coralServer,
		};

	});

})();
