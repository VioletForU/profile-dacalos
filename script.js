document.addEventListener("DOMContentLoaded", function () {
  var copyButton = document.getElementById("copy-button");
  var copyIndicator = document.getElementById("copy-indicator");
  var emailText = document.getElementById("email-text");

  if (!copyButton || !copyIndicator || !emailText) return;

  copyButton.addEventListener("click", function () {
    var email = emailText.textContent.trim();
    navigator.clipboard.writeText(email).then(function () {
      copyIndicator.textContent = "Copied!";
      setTimeout(function () {
        copyIndicator.textContent = "Copy";
      }, 2000);
    });
  });
});
