const express = require('express');
const twitchService = require('../services/twitchService');

const router = express.Router();

// Twitch routes
router.get('/auth', (req, res) => {
	twitchService.getCode(res);
});

router.get('/callback', (req, res) => {
	const {code} = req.query;
	twitchService.getTokensWithCode(code);
	res.redirect('/');
});

router.post('/start-raffle', (req, res) => {
	twitchService.startRaffle(req.body);
	res.redirect('/');
});

module.exports = router;
