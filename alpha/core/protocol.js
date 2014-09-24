(function() {
	'use strict';

	var protocol = {
		REGISTER: "register",
		UNREGISTER: "unregister",
		MESSAGE: "message",
		BROADCAST: "broadcast",
		PUBLISH: "publish",
		SUBSCRIBE: "subscribe",
		REPLY: "reply",

		SUBSCRIBE_TO: {
			ONE: "one",
			CLASS: "class"
		},

		isValidData: function(data) {
			switch (data.type) {
				case this.REGISTER:
					if (data.networkName && data.className) {
						return true;
					}
					return false;
				case this.UNREGISTER:
					if (data) {
						return true;
					}
					return false;
				case this.MESSAGE:
					if (data.message && data.to) {
						return true;
					}
					return false;
				case this.BROADCAST:
					if (data.message) {
						return true;
					}
					return false;
				case this.PUBLISH:
					if (data.message) {
						return true;
					}
					return false;
				case this.SUBSCRIBE:
					if (data.subscribeTo === this.SUBSCRIBE_TO.CLASS || 
						data.subscribeTo === this.SUBSCRIBE_TO.ONE &&
						data.name) {

						return true;
					}
					return false;
				case this.REPLY:
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

