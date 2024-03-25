const form = document.getElementById("login-form");
form.addEventListener("submit", function(e) {
    sessionStorage.username = document.getElementById("player-name").value;
});