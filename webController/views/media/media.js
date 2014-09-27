(function() {
	'use strict';
	app.factory('media', function($rootScope, socket, $sce, $http) {

		var posters = {
			list: {},
			get: function(name) {
				if (this.list[name] === undefined) {
					this.list[name] = "hlkh";
					var url = "http://www.omdbapi.com/?i=&t=" +
						name.substring(0, name.lastIndexOf('.'));
					$http.get(url).success(function(data) {
						console.log(data);
						if (data.Poster) {
							posters.list[name] = data.Poster;
						}
					});
				}
				return this.list[name];
			},
		};
		var media = {
			init: function() {
				socket.addHandler(publishHandler, "publish");
				socket.subscribe("publish", "class", "mediaServer");
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
		};

		function publishHandler(data) {
			console.log(data);
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

	app.controller('mediaController', function($scope, media, $rootScope) {
		$scope.getMedia = function() {
			return media.getMedia();
		};

		$scope.play = function(media) {
			$rootScope.playing = media;
			$scope.goTo("playing");
		};

		$scope.getPoster = media.getPoster;

	});
})();
