// Initialize button with user's preferred color
const startButton = document.getElementById("startButton");

// When the button is clicked, inject setPageBackgroundColor into current page
startButton.addEventListener("click", async () => {
  console.log("clicked!");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startCapture,
  });

  chrome.desktopCapture.chooseDesktopMedia(["tab"], tab, async (streamId) => {
    console.log("started desktopCapture OK", streamId);
    //check whether the user canceled the request or not
    if (streamId && streamId.length) {
    }

    chrome.tabs.sendMessage(tab.id, { streamId }, function (response) {
      // console.log(response.farewell);
    });

    // const outputVideoEl = document.getElementById("inputSource");
    // if (outputVideoEl) {
    //   try {
    //     outputVideoEl.srcObject = streamId;
    //     console.log("video stream assigned OK", streamId);
    //   } catch (e) {
    //     console.error("Assign stream error:", e);
    //   }
    // } else {
    //   console.error("outputElement missing!");
    // }
  });
});

// The body of this function will be executed as a content script inside the
// current page
function startCapture() {
  console.log("startCapture");
  // await navigator.mediaDevices.getUserMedia({
  //   video: {
  //     mandatory: {
  //       chromeMediaSource: "desktop",
  //       chromeMediaSourceId: streamId,
  //     },
  //   },
  // });
  chrome.runtime.onMessage.addListener((message) => {
    console.log("got message!", message);
  });
}
