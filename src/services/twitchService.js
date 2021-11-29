const tmi = require('tmi.js');
const fetch = require('node-fetch');

const twitchService = {};

twitchService.checkChat = () => {
	const client = new tmi.Client({
		options: {
				debug: true
		},
		identity: {
				username: 'jobodev',
				password: 'oauth:703yewp5pgp66q3n7avb6ttrdua138'
		},
		channels: [ 'joj3o', 'osjesleben' ]
	});

	client.connect();

	client.on('message', (channel, tags, message, self) => {
		// Ignore echoed messages.
		if(self) return;

		if(message.toLowerCase() === '!startraffle') {
			// "@alca, heya!"
			client.say(channel, 'Quick Access Raffle!');
			postToRaffle();
		}
	});
}

async function postToRaffle() {
	const raffleData = require('../routes/twitch').raffleData;

	const response = await fetch('http://localhost:3000/twitch/start-raffle', {
		method: 'post',
		body: JSON.stringify(raffleData),
		headers: {'Content-Type': 'application/json'}
	});
	// const data = await response.json();
	// console.log('data: ', data);
}

module.exports = twitchService;