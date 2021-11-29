const express = require('express');
const path = require('path');

const server = express();

server.use(express.urlencoded({
	extended: true
}));

server.use(express.static('src'));

const twitchService = require('./services/twitchService');
twitchService.checkChat();

const twitchRoutes = require('./routes/twitch').router;
server.use('/twitch', twitchRoutes);

const youtubeRoutes = require('./routes/youtube');
server.use('/yt', youtubeRoutes);

server.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);

server.listen(3000, () => console.log('Server is ready!'));
