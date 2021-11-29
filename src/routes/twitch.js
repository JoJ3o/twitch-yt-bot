const express = require('express');
const twitchRaffle = require('../services/twitchRaffle');

const router = express.Router();

let raffleData = {duration: 1};

// Twitch routes
router.get('/auth', (req, res) => {
	twitchRaffle.getCode(res);
});

router.get('/callback', (req, res) => {
	const {code} = req.query;
	twitchRaffle.getTokensWithCode(code);
	res.redirect('/');
});

router.post('/start-raffle', (req, res) => {
	if (Object.keys(req.body).length === 0) {
		twitchRaffle.startRaffle(raffleData);
	} else {
		twitchRaffle.startRaffle(req.body);
		raffleData = req.body;
	}
	res.redirect('/');
});

module.exports.router = router;
module.exports.raffleData = raffleData;
