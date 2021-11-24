const { google } = require('googleapis');
const util = require('util');
const fs = require('fs')

const writeFilePromise = util.promisify(fs.writeFile);
const readFilePromise = util.promisify(fs.readFile);

let liveChatID;
let channelID;
let nextPage;
const intervalTime = 5000;
let interval;
let chatMessages = [];
let raffleUsersEntered = [];
let raffleStarted = false;

const save = async(path, data) => {
	await writeFilePromise(path, data);
	console.log('Succesfully saved');
};

const read = async path => {
	const fileContents = await readFilePromise(path);
	return JSON.parse(fileContents);
};

const youtube = google.youtube('v3');

const Oauth2 = google.auth.OAuth2;

const clientID = "702193958045-mog7ismh8cv9j9gipkjkrj6h0rhkf6rh.apps.googleusercontent.com";
const clientSecret = "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";
const redirectURI = "http://localhost:3000/callback-yt";
const apiKey = "AIzaSyC-Nwezpbnq6gJAFWflaxRtymKgYMCVUpE";

const scope = [
	'https://www.googleapis.com/auth/youtube.readonly',
	'https://www.googleapis.com/auth/youtube.channel-memberships.creator'
];

const auth = new Oauth2(clientID, clientSecret, redirectURI);

const youtubeRaffle = {};

youtubeRaffle.getCode = response => {
	const authUrl = auth.generateAuthUrl({
		access_type: 'offline',
		scope
	})
	response.redirect(authUrl);
};

youtubeRaffle.getTokensWithCode = async code => {
	const credentials = await auth.getToken(code);
	youtubeService.authorize(credentials);
};

youtubeRaffle.authorize = ({tokens}) => {
	auth.setCredentials(tokens);
	console.log('Succesfully set credentials');
	console.log('tokens', tokens);
	save('./tokens.json', JSON.stringify(tokens));
};

auth.on('tokens', (tokens) => {
	console.log('New tokens received');
	save('./tokens.json', JSON.stringify(tokens));
});

// Check if previous tokens exist to avoid authentication every server restart
const checkTokens = async () => {
	try {
		if (fs.existsSync("./tokens.json")) {
			const tokens = await read('./tokens.json');
			if (tokens) {
				console.log('Setting tokens');
				return auth.setCredentials(tokens);
			}
			console.log('No tokens found');
		}
	} catch(err) {
		console.error(err);
	}
}

// API Calls
youtubeRaffle.findActiveChat = async() => {
	const response = await youtube.liveBroadcasts.list({
		auth,
		part: 'snippet',
		broadcastStatus: 'active'
	});
	const latestChat = response.data.items[0];
	channelID = latestChat.snippet.channelId;
	liveChatID = latestChat.snippet.liveChatId;
	console.log('Channel ID found', channelID);
	console.log('Chat ID found', liveChatID)
}

const checkSub = async channelId => {
	try {
		const response = await youtube.subscriptions.list({
			key: apiKey,
			part: ['snippet', 'contentDetails', 'subscriberSnippet'],
			channelId: channelId,
			forChannelId: channelID
		});
		if (response.data.pageInfo.totalResults >= 1) {
			return true;
		}
	} catch (err) {
		console.log("Catched bish");
		console.log(err.message);
	}
	return false;
}

const checkMember = async channelId => {
	try {
		const response = await youtube.members.list({
			auth,
			part: 'snippet'
		});
		console.log(response.data);

	} catch (err) {
		console.log("Catched!");
		console.log(err.message);
	}
	return false
}

const respond = (newMessages, data) => {
	newMessages.forEach(message => {
		const messageText = message.snippet.displayMessage.toLowerCase();
		const author = message.authorDetails.displayName;
		console.log('Message:', messageText, ' || Author:', author);
		if (messageText == data.enterMessage && !raffleUsersEntered.includes(author)) {
			if (data.subOnly.at(-1) == 1) {
				checkSub(message.authorDetails.channelId).then(function(results){
					if (results == true) {
						console.log(author, "is subscribed!");
						for (let i = 0; i < data.subPrivilege; i++) {
							raffleUsersEntered.push(author);
						}
					}
				});
			} else if (data.memberOnly.at(-1) == 1) {
				checkMember(message.authorDetails.channelId).then(function(results){
					if (results == true) {
						console.log(author, "is a Member!");
						for (let i = 0; i < data.memberPrivilege; i++) {
							raffleUsersEntered.push(author);
						}
					}
				});
			} else {
				console.log(data.subPrivilege);
				if (data.subPrivilege > 1 && data.subPrivilege > data.memberPrivilege) {
					checkSub(message.authorDetails.channelId).then(function(results){
						if (results == true) {
							for (let i = 0; i < data.subPrivilege - 1; i++) {
								raffleUsersEntered.push(author);
							}
						}
					});
				} else if (data.memberPrivilege > data.subPrivilege) {
					checkMember(message.authorDetails.channelId).then(function(results){
						if (results == true) {
							for (let i = 0; i < data.memberPrivilege - 1; i++) {
								raffleUsersEntered.push(author);
							}
						}
					});
				}
				raffleUsersEntered.push(author);
			}
		}
	});
}

const getChatMessages = async(raffleData) => {
	console.log('Get chat');
	const response = await youtube.liveChatMessages.list({
		auth,
		part: ['snippet', 'authorDetails'],
		liveChatId: liveChatID,
		maxResults: 2000,
		pageToken: nextPage
	});
	const {data} = response;
	const newMessages = data.items;
	nextPage = data.nextPageToken;
	if (raffleStarted) {
		chatMessages.push(...newMessages);
		respond(newMessages, raffleData);
	}
	raffleStarted = true;
	console.log('Total chat messages:', chatMessages.length);
		for (let i=0;i<newMessages.length;i++) {
		console.log(printMessage(newMessages[i]));
	}
}

const printMessage = message => {
	const d = new Date();
	let hour = d.getUTCHours();
	let minutes = d.getUTCMinutes();
	let user = message.authorDetails.displayName;
	let messageText = message.snippet.displayMessage;
	return '[' + hour + ':' + minutes + '] ' + 'User: ' + user + ' | Message: ' + messageText;
}

const startTrackingChat = async(data) => {
	console.log("Start raffle");
	interval = setInterval(function() { getChatMessages(data); }, intervalTime);
}

const stopTrackingChat = async(winnerAmount, duplicateWinners) => {
	console.log('Stop raffle');
	clearInterval(interval);
	raffleStarted = false;
	console.log(raffleUsersEntered);
	pickWinner(winnerAmount, duplicateWinners);
	raffleUsersEntered = [];
}

youtubeRaffle.startRaffle = async(data) => {
	console.log('Start');
	startTrackingChat(data);
	setTimeout(function() {stopTrackingChat(data.winnerAmount, data.duplicateWinners);}, (data.duration * (60/2) * 1000));
}

const pickWinner = (winnerAmount, duplicateWinners) => {
	let winnerArray = [];
	for (let i = 0; i < winnerAmount; i++) {
		if (raffleUsersEntered.length != 0) {
			const random = Math.floor(Math.random() * raffleUsersEntered.length);
			winnerArray.push(raffleUsersEntered[random]);
			if (duplicateWinners.at(-1) == 0) {
				let i = 0;
				const arrayItem = raffleUsersEntered[random];
				while (i < raffleUsersEntered.length) {
					if (raffleUsersEntered[i] === arrayItem) {
						raffleUsersEntered.splice(i, 1);
					} else {
						++i;
					}
				}
			} else {
				raffleUsersEntered.splice(random, 1);
			}

			console.log(random, winnerArray, raffleUsersEntered);
		}
	}
	console.log(winnerArray);
}

checkTokens();

module.exports = youtubeRaffle;
