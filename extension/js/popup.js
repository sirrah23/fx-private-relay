/* global browser */

function showSignUpPanel() {
  const signUpOrInPanel = document.querySelector(".sign-up-panel");
  return signUpOrInPanel.classList.remove("hidden");
}

function showRelayPanel() {
  const relayPanel = document.querySelector(".signed-in-panel");
  return relayPanel.classList.remove("hidden");
}

async function popup() {
  const userApiToken = await browser.storage.local.get("apiToken");
  if (!userApiToken.hasOwnProperty("apiToken")) {
    showSignUpPanel();
  } else {
    showRelayPanel();
  }

  document.querySelectorAll(".generate-alias").forEach(generateAliasBtn => {
    generateAliasBtn.addEventListener("click", async() => {
      const newRelayAddressResponse = await browser.runtime.sendMessage({
        method: "makeRelayAddress",
      });

      if (!newRelayAddressResponse) {
        return;
      }

      const aliasDisplay = document.querySelector(".alias-display");
      const aliasText = document.querySelector(".alias");
      const aliasWrapper = document.querySelector(".alias-wrapper");

      // Show error message if the user already has 5 active aliases
      // TODO: Catch this earlier and show the message before they try to click
      // the generate buttons.
      if (newRelayAddressResponse.status === 402) {
        const errorMessageWrapper = document.querySelector(".error-message-wrapper");
        errorMessageWrapper.classList.remove("hidden");
        aliasDisplay.classList.add("show-error")
        if (aliasDisplay.classList.contains("show-alias")) {
          aliasText.classList.remove("show-alias");
          aliasWrapper.classList.add("hidden");
        }
        return;
      }

      // show newly created alias
      aliasText.textContent = newRelayAddressResponse;
      aliasWrapper.classList.remove("hidden");
      aliasDisplay.classList.add("show-alias");

      // Copy text to clipboard
      // TODO allow users to access this alias and copy it again
      // from the panel.
      navigator.clipboard.writeText(newRelayAddressResponse);
    });
  });

  document.querySelectorAll(".close-popup-after-click").forEach(el => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      await browser.tabs.create({ url: el.href });
      window.close();
    });
  });
}

document.addEventListener("DOMContentLoaded", popup);
