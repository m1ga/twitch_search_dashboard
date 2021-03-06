const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const server = http.createServer(app);
var hasNextPage = true;
const {
	Server
} = require("socket.io");
const io = new Server(server);
var blockList = [];
var lastDate = "";
const axios = require('axios');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
	console.log('Server listening on http://127.0.0.1:3000');
});

if (fs.existsSync("blockList.json")) {
	fs.readFile("blockList.json", 'utf8', function(err, data) {
		blockList = JSON.parse(data);
		console.log("Blocked user count: " + blockList.length);
	});
} else {

}

app.use(express.static('public'));

var customData = [{
	"operationName": "DirectoryPage_Game",
	"variables": {
		"name": "science & technology",
		"options": {
			"includeRestricted": ["SUB_ONLY_LIVE"],
			"sort": "RECENT",
			"recommendationsContext": {
				"platform": "web"
			},
			"requestID": "JIRA-VXP-2397",
			"tags": []
		},
		"sortTypeIsRecency": true,
		"limit": 50
	},
	"extensions": {
		"persistedQuery": {
			"version": 1,
			"sha256Hash": "5feb6766dc5d70b33ae9a37cda21e1cd7674187cb74f84b4dd3eb69086d9489c"
		}
	}
}];

axios.defaults.baseURL = 'https://gql.twitch.tv';
axios.defaults.headers.post['Client-ID'] = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

async function getData(data) {
	var obj = [];
	await axios.post("/gql", data).then(function(response) {
		var json = response.data;
		json.forEach((item, i) => {
			if (item.data && item.data.game && item.data.game.streams) {
				item.data.game.streams.edges.forEach((game, i) => {
					var link = "";

					if (game.node.broadcaster && game.node.broadcaster.login) {
						link = game.node.broadcaster.login;
						customData[0].variables.cursor = game.cursor;
						if (blockList.indexOf(link) == -1) {
							var displayDate = "";

							if (game.node.createdAt) {
								var tmpDate = new Date(game.node.createdAt);
								var tmpH = (tmpDate.getHours() < 10) ? "0" + tmpDate.getHours() : tmpDate.getHours();
								var tmpM = (tmpDate.getMinutes() < 10) ? "0" + tmpDate.getMinutes() : tmpDate.getMinutes();

								displayDate = tmpH + ":" + tmpM;
								if (new Date().getTime() - tmpDate.getTime() < 60000) {
									displayDate = "just now";
								}
							}
							obj.push({
								link: 'https://twitch.tv/' + link,
								img: game.node.previewImageURL,
								date: game.node.createdAt || 0,
								displayDate: displayDate,
								viewersCount: game.node.viewersCount,
								username: link,
								title: game.node.title,
								isPartner: game.node.broadcaster.roles.isPartner,
								tags: game.node.tags
							});
						}
					}
				});
				hasNextPage = item.data.game.streams.pageInfo.hasNextPage;
			}
		});
	});
	return obj;
}

async function collectData(data) {
	var topic = data.topic || "just chatting";
	var order = "RECENT";
	if (data.lang != "") {
		customData[0].variables.options.tags = [data.lang];
	} else {
		customData[0].variables.options.tags = [];
	}

	if (data.order == "high_low") {
		order = "VIEWER_COUNT";
		customData[0].variables.sortTypeIsRecency = false;
	} else if (data.order == "low_high") {
		order = "VIEWER_COUNT_ASC";
		customData[0].variables.sortTypeIsRecency = false;
	} else {
		customData[0].variables.sortTypeIsRecency = true;
	}
	customData[0].variables.options.sort = order;
	customData[0].variables.name = topic;
	await getData(customData).then(function(res) {
		objs = res
	})

	return {
		"topic": topic,
		"data": objs
	}
}



io.on('connection', (socket) => {
	// console.log('a user connected');

	socket.on('update', (data) => {
		// console.log("update data");
		customData[0].variables.cursor = null;
		collectData(data).then(function(data) {
			data.hasNextPage = hasNextPage;
			io.emit('data', data)
		})
	});

	socket.on('loadMore', (data) => {
		// console.log("get more data");
		collectData(data).then(function(data) {
			data.isAppend = true;
			data.hasNextPage = hasNextPage;
			io.emit('data', data)
		})
	});

	socket.on('blockUser', (data) => {
		// console.log("block user: " + data.user);
		blockList.push(data.user);
		fs.writeFile("blockList.json", JSON.stringify(blockList), function(err) {});
	});
});


io.sockets.on('connection', function(socket) {
	// console.log("connection");
});
