const express = require('express');
const twitchRaffle = require('../services/twitchRaffle');

const router = express.Router();

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
	twitchRaffle.startRaffle(req.body);
	res.redirect('/');
});

module.exports = router;
