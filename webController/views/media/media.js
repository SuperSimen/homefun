(function() {
	'use strict';
	app.factory('media', function($rootScope, coral, $sce, $http, devices, utility) {


		var posters = {
			list: {},
			get: function(filename) {
				var title = utility.getParameterFromFilename(filename, 't');
				var year = utility.getParameterFromFilename(filename, 'y');
				if (this.list[filename] === undefined) {
					this.list[filename] = "";
					if (title) {
						var url = "http://www.omdbapi.com/?";
						url += "&t=" + title;
						if (year) {
							url += "&y=" + year;
						}
						$http.get(url).success(function(data) {
							console.log(data);
							if (data.Poster) {
								posters.list[filename] = data.Poster;
							}
							else {
								posters.list[filename] = -1;
							}
						}).error(function(data) {
							console.error(data);
						});
					}
					else {
						posters.list[filename] = -1;
					}
				}
				return this.list[filename];
			},
		};
		var media = {
			init: function() {
				coral.addHandler(publishHandler, "publish");
				coral.subscribe("publish", "class", "mediaServer");
				$rootScope.$watch(
					function() {return devices.list;},
					function(newValue) {
						media.updateServers(newValue);
					},
					true
				);
			},
			getPoster: function(name) {
				return posters.get(name);
			},
			servers: {},
			newServer: function(mediaServerId, path) {
				if (!this.servers[mediaServerId]) {
					this.servers[mediaServerId] = {
						mediaList: [],
						path: path,
						setMedia: function(list) {
							this.mediaList.length = 0;
							for (var i in list) {
								this.mediaList.push({
									title: list[i],
									path: $sce.trustAsResourceUrl(this.path + "/" + list[i]),
								});
								posters.get(list[i]);
							}
						}
					};
				}
				return this.servers[mediaServerId];
			},
			getServer: function(serverId) {
				return this.servers[serverId];
			},
			getMedia: function() {
				var mediaList = [], tempMediaList;

				for (var server in this.servers) {
					tempMediaList = this.servers[server].mediaList;
					for (var i = 0; i < tempMediaList.length; i++) {
						mediaList.push(tempMediaList[i]);
					}
				}

				return mediaList;
			},
			updateServers: function(onlineDevices) {
				var onlineIds = [], i;
				for (i = 0; i < onlineDevices.length; i ++) {
					onlineIds.push(onlineDevices[i].id);
				}
				for (i in this.servers) {
					if (onlineIds.indexOf(i) === -1) {
						delete this.servers[i];
					}
				}
			},
		};

		function publishHandler(data) {
			$rootScope.$apply(function() {
				var server = media.getServer(data.fromId);
				if (!server) {
					server = media.newServer(data.fromId, data.message.path);
				}
				server.setMedia(data.message.files);
			});
		}

		return media;

	});

	app.controller('mediaController', function($scope, media, $rootScope, coral) {
		$scope.getMedia = function() {
			return media.getMedia();
		};

		$scope.play = function(media) {
			if ($scope.isActive("media")) {
				$rootScope.playing = media;
				$scope.goTo("playing");
			}
			else if ($scope.isActive("devices")) {
				$scope.control('load', media);
			}
		};


		$scope.getPoster = media.getPoster;

		var colorList = {};
		$scope.getRandomColor = function(id) {
			if (!colorList[id]) {
				var index = Math.floor(Math.random() * 7 + 1);
				colorList[id] = index + 1;
			}
			var color =  "color-" + colorList[id];

			return color;
		};

	});

	app.factory('utility', function() {
		var utility = {};

		utility.getParameterFromFilename = function(filename, parameterName) {
			var parameters, parameterValue;
			if (filename.indexOf('&') !== -1) {
				parameters = filename.substring(filename.indexOf('&') + 1);

				var indexOfParameter = filename.indexOf('&' + parameterName);
				if (indexOfParameter !== -1) {
					parameterValue = parameters.substring(indexOfParameter + 2);
					if (parameterValue.indexOf('&') !== -1) {
						parameterValue = parameterValue.substring(0, parameterValue.indexOf('&'));
					}
					else if (parameterValue.indexOf('.') !== -1) {
						parameterValue = parameterValue.substring(0, parameterValue.indexOf('.'));
					}
				}
			}
			return parameterValue;
		};

		return utility;
	});
})();
