const express = require('express');
const youtubeService = require('../services/youtubeService');

const router = express.Router();

// Youtube routes
router.get('/auth', (req, res) => {
	youtubeService.getCode(res);
});

router.get('/callback', (req, res) => {
	const {code} = req.query;
	youtubeService.getTokensWithCode(code);
	res.redirect('/');
});

router.get('/find-active-chat', (req, res) => {
	youtubeService.findActiveChat();
	res.redirect('/');
});

router.post('/start-raffle', (req, res) => {
	console.log(req.body);
	youtubeService.startRaffle(req.body);
	res.redirect('/');
})

module.exports = router;
