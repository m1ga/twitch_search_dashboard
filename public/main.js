const socket = io('http://127.0.0.1:3000');
const template = document.getElementById('template').innerHTML;
var autoUpdateTimer = null;
var isAutoUpdate = false
var topic = window.localStorage.getItem("twitchTopic");
var updateTime = window.localStorage.getItem("updateTime") || 10000;

document.getElementById("timeValue").value = Math.floor(updateTime / 1000);
document.getElementById("autoUpdate").checked = false;

if (topic != undefined) {
	document.getElementById("topic").value = topic;
}

socket.on('data', function(obj) {
	var output = "";
	var rendered = Mustache.render(template, obj);
	if (obj.isAppend) {
		document.getElementById("content").insertAdjacentHTML("beforeend", rendered);
	} else {
		document.getElementById("content").innerHTML = rendered;
	}

	if (obj.hasNextPage == false) {
		document.getElementById("more").style.display = "none";
	} else {
		document.getElementById("more").style.display = "block";
	}

	document.getElementById("loader").classList.remove("visible");
})



function update() {
	if (!isAutoUpdate) document.getElementById("loader").classList.add("visible");

	window.localStorage.setItem("twitchTopic", document.getElementById("topic").value);

	socket.emit("update", {
		topic: document.getElementById("topic").value,
		lang: document.getElementById("language").value,
		order: document.getElementById("order").value
	})
}

function loadMore() {
	if (!isAutoUpdate) document.getElementById("loader").classList.add("visible");
	socket.emit("loadMore", {
		topic: document.getElementById("topic").value,
		lang: document.getElementById("language").value,
		order: document.getElementById("order").value
	})
}

function blockUser(evt, user) {
	evt.preventDefault();
	var el = document.querySelector(".user_" + user);
	el.parentNode.removeChild(el);

	socket.emit("blockUser", {
		user: user
	})
	return false;
}
update();


function autoUpdate() {
	isAutoUpdate = document.getElementById("autoUpdate").checked;

	if (updateTime < 5000) {
		document.getElementById("timeValue").value = 5;
		updateTime = 5000;
	}

	window.localStorage.setItem("updateTime", updateTime)

	if (isAutoUpdate) {
		autoUpdateTimer = setInterval(function() {
			update();
		}, updateTime);
	} else {
		clearInterval(autoUpdateTimer);
	}
}

function onChange() {
	clearInterval(autoUpdateTimer);
	document.getElementById("autoUpdate").checked = false;

	var val = document.getElementById("timeValue").value;
	val = parseInt(val);
	if (Number.isInteger(val)) {
		updateTime = val * 1000;
	}
}
