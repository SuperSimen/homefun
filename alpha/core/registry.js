(function () {
	'use strict';

	var components = {
		list: {}
	};

	var networks = {
		list: {},
		getNetwork: function(name) {
			if (!this.list[name]) {
				this.list[name] = newNetwork(name);
			}
			return this.list[name];
		}
	};

	function newNetwork(networkName) {
		return {
			name: networkName,
			classes: {},
			getClass: function(name) {
				if (!this.classes[name]) {
					this.classes[name] = newClass(name);
					return this.classes[name];
				}
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
		};
	}

	function newClass(className) {
		return {
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
				if (this.components.indexOf(id) != -1) {
					this.components.slice(this.components.indexOf(id), 1);
				}
				else {
					console.error("cannot remove component");
				}
			},
			getComponents: function() {
				return this.components;
			}
		};
	}

	var registry = {
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
					className: className,
					networkName: networkName,
				};

				networks.getNetwork(networkName).getClass(className).addComponent(id);
			}
		},
		deregister: function(sessionObject) {
			var id = sessionObject.getId();
			if (components.list[id]) {
				delete components.list[id];
				networks.getNetwork(networkName).getClass(className).removeComponent(id);
			}
			else {
				return "unregister impossible, id not found";
			}
		},
		get: function(id) {
			if (components.list[id]) {
				return components.list[id];
			}
			else {
				console.error("get impossible, id not found");
			}
		},
		getNetwork: function(networkName) {
			return networks.list[name];
		}
	};
	
	module.exports = registry;

})();
