(function() {
	'use strict';

	var protocol = {
		TYPE: {
			REGISTER: "register",
			UNREGISTER: "unregister",
			MESSAGE: "message",
			BROADCAST: "broadcast",
			PUBLISH: "publish",
			SUBSCRIBE: "subscribe",
			SERVER_ACK: "server_ack",
			PRESENCE: "presence",
			POLL: "poll"
		},

		SUBSCRIBE: {
			TO: {
				ALL: "all",
				CLASS: "class",
				ONE: "one",
			}
		},

		isValidData: function(data) {
			switch (data.type) {
				case this.TYPE.REGISTER:
					if (data.networkName && data.className) {
						return true;
					}
					return false;
				case this.TYPE.UNREGISTER:
					if (data) {
						return true;
					}
					return false;
				case this.TYPE.MESSAGE:
					if (data.message && data.to) {
						return true;
					}
					return false;
				case this.TYPE.BROADCAST:
					if (data.message) {
						return true;
					}
					return false;
				case this.TYPE.PUBLISH:
					if (data.message) {
						return true;
					}
					return false;
				case this.TYPE.SUBSCRIBE:
					if (data.subscribe) {
						if (data.subscribe.type === protocol.TYPE.PRESENCE ||
							data.subscribe.type === protocol.TYPE.PUBLISH) {
							if (data.subscribe.to === protocol.SUBSCRIBE.TO.ALL ||
								data.subscribe.to === protocol.SUBSCRIBE.TO.CLASS) {
								return true;
							}
						}
					}
					return false;
				case this.TYPE.SERVER_ACK:
					if (data) {
						return true;
					}
					return false;
				default:
					return false;
			}
		},
	};

	module.exports = protocol;
})();

