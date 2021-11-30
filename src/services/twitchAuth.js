const clientID = "4l677vx5awpv96fou6fy1c68czce91";
const clientSecret = "6c166zmuwpwc49dt70bz3hiq9aoq98";
const redirectURL = "http://localhost:3000/callback-twitch";
const state = "yoassboevink";

const scopes = "chat:edit chat:read";

const twitchAuth = {};

twitchAuth.getCode = response => {
	const authUrl = "https://id.twitch.tv/oauth2/authorize?response_type=code&force_verify=true&client_id="+clientID+"&redirect_uri="+redirectURL+"&scope="+scopes+"&state="+state+""
	response.redirect(authUrl);
}

twitchAuth.getTokensWithCode = async code => {
	const tokenUrl = "https://id.twitch.tv/oauth2/token?client_id="+clientID+"&client_secret="+clientSecret+"&code="+code+"&grant_type=authorization_code&redirect_uri="+redirectURL+""
	response.redirect(tokenUrl);
}

module.exports = twitchAuth;
