const tmi = require('tmi.js');

const twitchRaffle = {};

twitchRaffle.startRaffle = async(data) => {
	console.log(data);

	console.log('Start Twitch Raffle');

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

	let raffleUsersEntered = [];
	let noDefaults = false;

	client.connect().then(() => {
		if (Object.keys(data).length === 1) {
			client.say('#osjesleben', 'Please enter default values in the Babble editor first');
			noDefaults = true;
		} else {
			client.say('#osjesleben', 'Raffle started! Type !join to enter');
		}
	});


	client.on('message', (channel, tags, message, self) => {
		// Ignore echoed messages.
		if(self) return;
		console.log(channel);
		filterMessage(channel, tags, message, data.enterMessage, raffleUsersEntered);
	});

	setTimeout(function() {
		if (noDefaults == true) {
			client.disconnect();
			return;
		}
		console.log(raffleUsersEntered);
		if (data.announceWinners.at(-1) == 1) {client.say('#osjesleben', 'The winners of the raffle are: ' + raffleUsersEntered.join(", "))};
		client.disconnect();
	}, (data.duration * (60/4) * 1000));
}

const filterMessage = async(channel, tags, message, enterMessage, raffleUsersEntered) => {
	if(message.toLowerCase() === enterMessage) {
		raffleUsersEntered.push(tags.username);
	}
}

// const endRaffle = () => {
// 	console.log(raffleUsersEntered);
// 	raffleUsersEntered = [];
// }

module.exports = twitchRaffle;
