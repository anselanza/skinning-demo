// Initialize button with user's preferred color
const startButton = document.getElementById("startButton");

// When the button is clicked, inject setPageBackgroundColor into current page
startButton.addEventListener("click", async () => {
  console.log("clicked!");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.desktopCapture.chooseDesktopMedia(["window"], tab, (streamId) => {
    console.log("started desktopCapture OK", streamId);
    //check whether the user canceled the request or not
    if (streamId && streamId.length) {
    }

    const outputVideoEl = document.getElementById("inputSource");
    if (outputVideoEl) {
      try {
        outputVideoEl.srcObject = streamId;
        console.log("video stream assigned OK", streamId);
      } catch (e) {
        console.error("Assign stream error:", e);
      }
    } else {
      console.error("outputElement missing!");
    }
  });

  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: startCapture,
  // });
});

// The body of this function will be executed as a content script inside the
// current page
function startCapture() {
  console.log("startCapture");
}
