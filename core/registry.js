(function () {
	'use strict';

	var protocol;

	var components = {
		list: {}
	};

	var networks = {
		list: {},
		get: function(name) {
			if (!this.list[name]) {
				this.list[name] = newNetwork(name);
			}
			return this.list[name];
		},
	};

	function newNetwork(networkName) {
		var tempNetwork = {
			name: networkName,
			classes: {},
			getClass: function(name) {
				if (!this.classes[name]) {
					this.classes[name] = newClass(name);
				}
				return this.classes[name];
			},
			getComponents: function() {
				var result = [];
				var components;
				for (var className in this.classes) {
					components = this.classes[className].components;
					for (var componentId in components) {
						result.push(components[componentId]);
					}
				}
				return result;
			},
			broadcast: function(data) {
				var components = this.getComponents();
				for (var i in components) {
					registry.get(components[i]).send(data);
				}
			}
		};
		tempNetwork.subscribers = newSubscribers(function() {
			return tempNetwork.getComponents();
		});

		return tempNetwork;
	}

	function newClass(className) {
		var tempClass = {
			name: className,
			components: [],
			addComponent: function(id) {
				if (this.components.indexOf(id) != -1) {
					console.error("cannot add component");
				}
				else {
					this.components.push(id);
				}
			},
			removeComponent: function(id) {
				if (this.components.indexOf(id) !== -1) {
					this.components.splice(this.components.indexOf(id), 1);
				}
				else {
					console.error("cannot remove component");
				}
			},
			getComponents: function() {
				return this.components;
			},
			broadcast: function(data) {
				for (var i in this.components) {
					registry.get(this.components[i]).send(data);
				}
			}
		};
		tempClass.subscribers = newSubscribers(function() {
			return tempClass.getComponents();
		});

		return tempClass;
	}

	function newSubscribers(getComponents) {

		function getSendPresenceUpdate(componentId) {
			return function() {

				var component = registry.get(componentId);
				if (!component) {
					tempSubscribers.remove(componentId);
				}
				else {
					var componentIds = getComponents();
					var components = [];
					for (var i in componentIds) {
						components.push(registry.get(componentIds[i]));
					}

					var message = {
						type: protocol.TYPE.PRESENCE,
						presence: components,
					};
					component.send(message);
				}
			};
		}
		function getSendPublishMessage(componentId) {
			return function(message) {
				var component = registry.get(componentId);
				if (!component) {
					tempSubscribers.remove(componentId);
				}
				else {
					component.send(message);
				}
			};
		}

		var tempSubscribers = {
			list: {},
			subscribe: function(componentId, type) {
				if (!this.list[componentId]) {
					this.list[componentId] = {
						id: componentId,
						type: {
							presence: false,
							publish: false,
						}
					};	
				}

				this.list[componentId].type[type] = true;

				if (type === protocol.TYPE.PRESENCE) {
					this.list[componentId].sendPresenceUpdate = getSendPresenceUpdate(componentId);
					this.list[componentId].sendPresenceUpdate();
				}
				if (type === protocol.TYPE.PUBLISH) {
					this.list[componentId].sendPublishMessage = getSendPublishMessage(componentId);
				}
			},
			isSubscribed: function(componentId) {
				return !!this.list[componentId];
			},
			broadcastPresenceUpdate: function() {
				for (var i in this.list) {
					if (this.list[i].type.presence) {
						this.list[i].sendPresenceUpdate();
					}
				}
			},
			broadcastPublishMessage: function(message) {
				for (var i in this.list) {
					if (this.list[i].type.publish) {
						this.list[i].sendPublishMessage(message);
					}
				}
			},
			remove: function(componentId) {
				if (this.list[componentId]) {
					delete this.list[componentId];
				}
			},
		};

		return tempSubscribers;
	}

	var registry = {
		importProtocol: function(protocolImport) {
			protocol = protocolImport;
		},
		register: function(sessionObject, networkName, className) {
			var id = sessionObject.getId();
			if (components.list[id]) {
				return "register impossible, id not unique"; 
			}
			else {
				components.list[id] = {
					send: sessionObject.send,
					close: sessionObject.close,
					remoteAddress: sessionObject.remoteAddress,
					remotePort: sessionObject.remotePort,
					id: id,
					name: "",
					className: className,
					networkName: networkName,
					subscribeTo: function(to, value, type) {
						var poll = {
							type: protocol.TYPE.POLL,
						}
						if (to === protocol.SUBSCRIBE.TO.ALL) {
							networks.get(this.networkName).subscribers.subscribe(this.id, type);

							if (type === protocol.TYPE.PUBLISH) {
							   	networks.get(this.networkName).broadcast(poll);
							}
						}
						else if (to === protocol.SUBSCRIBE.TO.CLASS) {
							networks.get(this.networkName).getClass(value).subscribers.subscribe(this.id, type);

							if (type === protocol.TYPE.PUBLISH) {
								networks.get(this.networkName).getClass(value).broadcast(poll);
							}
						}
					}
				};

				networks.get(networkName).getClass(className).addComponent(id);
			}

			networks.get(networkName).subscribers.broadcastPresenceUpdate();

		},
		deregister: function(componentId) {
			var component = components.list[componentId];
			if (component) {
				networks.get(component.networkName).getClass(component.className).removeComponent(componentId);

				delete components.list[componentId];
			}
			else {
				return "deregister impossible, id not found";
			}

			networks.get(component.networkName).subscribers.broadcastPresenceUpdate();
		},
		get: function(componentId) {
			return components.list[componentId];
		},
		getNetwork: function(networkName) {
			return networks.list[networkName];
		},
	};
	
	module.exports = registry;

})();
