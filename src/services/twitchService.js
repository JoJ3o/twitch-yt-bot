const tmi = require('tmi.js');

let raffleUsersEntered = [];

const twitchService = {};

twitchService.startRaffle = async(data) => {
	console.log('Start Twitch Raffle');
	console.log(data);

	const client = new tmi.Client({
		options: {
			debug: true
		},
		identity: {
			username: 'jobodev',
			password: 'oauth:703yewp5pgp66q3n7avb6ttrdua138'
		},
		channels: [ 'joj3o' , 'osjesleben' ]
	});

	client.connect();

	client.on('message', (channel, tags, message, self) => {
		// Ignore echoed messages.
		if(self) return;

		filterMessage(channel, tags, message, data.enterMessage);
	});

	setTimeout(function() {
		client.disconnect(),
		endRaffle()
	}, (data.duration * (60/2) * 1000));
}

const filterMessage = async(channel, tags, message, enterMessage) => {
	if(message.toLowerCase() === enterMessage) {
		raffleUsersEntered.push(tags.username);
	}
}

const endRaffle = () => {
	console.log(raffleUsersEntered);
	raffleUsersEntered = [];
}

module.exports = twitchService;
