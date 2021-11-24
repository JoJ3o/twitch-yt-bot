const express = require('express');
const youtubeRaffle = require('../services/youtubeRaffle');

const router = express.Router();

// Youtube routes
router.get('/auth', (req, res) => {
	youtubeRaffle.getCode(res);
});

router.get('/callback', (req, res) => {
	const {code} = req.query;
	youtubeRaffle.getTokensWithCode(code);
	res.redirect('/');
});

router.get('/find-active-chat', (req, res) => {
	youtubeRaffle.findActiveChat();
	res.redirect('/');
});

router.post('/start-raffle', (req, res) => {
	console.log(req.body);
	youtubeRaffle.startRaffle(req.body);
	res.redirect('/');
})

module.exports = router;
