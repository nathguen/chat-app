const socket = io();

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
}

socket.on("locationMessage", (message) => {
  displayMessage(message, locationTemplate);
});

socket.on("message", (message) => {
  displayMessage(message, messageTemplate);
});
