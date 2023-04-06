const socket = io();

// Audio
const newMessageAudio = new Audio("/audio/message.wav");
const newUserAudio = new Audio("/audio/joined.wav");
const leaveAudio = new Audio("/audio/leave.wav");

// Elements
const $chatEl = document.querySelector("#chat");
const $inputEl = document.querySelector("#message-input");
const $shareButton = document.querySelector("#share-location");
const $sendButton = document.querySelector("#send-button");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const getUserData = () => {
  const userData = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  if (userData.username) {
    userData.username = userData.username.toLowerCase().trim();
  }

  return userData;
};

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - (newMessageHeight * 2) <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // disable
  $sendButton.setAttribute("disabled", "disabled");
  $inputEl.setAttribute("disabled", "disabled");

  const message = $inputEl.value;
  socket.emit("sendMessage", message);

  // enable
  $sendButton.removeAttribute("disabled");
  $inputEl.removeAttribute("disabled");

  // clear input
  $inputEl.value = "";

  // focus
  $inputEl.focus();
});

$shareButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $shareButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude });
    $shareButton.removeAttribute("disabled");
  });
});

function displayMessage(message, template) {
  const { text, url, createdAt, username } = message;

  const html = Mustache.render(template, {
    url,
    username,
    message: text,
    createdAt: moment(createdAt).format("h:mma"),
  });

  $messages.insertAdjacentHTML("beforeend", html);

  const { username: currentUserName } = getUserData();
  if (username !== currentUserName && username !== "Admin") {
    newMessageAudio.play();
  }

  if (username === "Admin" && text.includes("has joined")) {
    newUserAudio.play();
  }

  if (username === "Admin" && text.includes("has left")) {
    leaveAudio.play();
  }

  // auto scroll
  autoScroll();
}

socket.on("locationMessage", (message) => {
  displayMessage(message, locationTemplate);
});

socket.on("message", (message) => {
  displayMessage(message, messageTemplate);
});

// Options
const { username, room } = getUserData();
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});
