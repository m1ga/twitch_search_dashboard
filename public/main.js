var socket = io('http://127.0.0.1:3000');
var template = document.getElementById('template').innerHTML;

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
    document.getElementById("loader").classList.add("visible");
    socket.emit("update", {
        topic: document.getElementById("topic").value,
        lang: document.getElementById("language").value,
        order: document.getElementById("order").value
    })
}

function loadMore() {
    document.getElementById("loader").classList.add("visible");
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
