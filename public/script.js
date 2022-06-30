const socket = io("/");
const myPeer = new Peer(undefined, {
    host: "/",
    port: "3001",
});
const peers = {};
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

const chatBox = document.getElementById("chat-form");

myVideo.muted = true;
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });
    });

socket.on("message", (message) => {
    //console.log(message);

    outputMessage(message);
});

socket.on("user-disconnected", (userId) => {
    if (peers[userId]) {
        peers[userId].close();
    }
});

myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

// socket.on("user-connected", (userId) => {
//     console.log("user connected:    " + userId);
// });

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

chatBox.addEventListener("submit", (e) => {
    e.preventDefault();
    let msg = e.target.elements.chatInput.value;

    msg = msg.trim();

    socket.emit("sendMessage", msg);
    //console.log(msg);

    e.target.elements.chatInput.value = "";
    e.target.elements.chatInput.focus();
});

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    videoGrid.append(video);
}

function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    const p = document.createElement("p");
    p.classList.add("meta");
    p.innerHTML = "Author on xx/xx/xx";
    div.appendChild(p);
    const para = document.createElement("p");
    para.classList.add("text");
    para.innerText = message;
    div.appendChild(para);
    document.querySelector(".display-msg").appendChild(div);
}
