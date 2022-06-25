import { loadSystem } from "./PoseDetection";

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

    setTimeout(() => {
      console.log("send streamId now...");
      chrome.tabs.sendMessage(tab.id, { streamId }, function (response) {
        console.log("sending message with ", { streamId });
        console.log({ response });
      });
    }, 1000);

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
// current page. OUTPUT WILL BE IN THE CURRENT PAGE (not the popup inspector)!
function startCapture() {
  console.log("startCapture");
  chrome.runtime.onMessage.addListener(async (message) => {
    console.log("got message!", message);
    const { streamId } = message;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId,
          },
        },
      });
      console.log("got stream OK:", mediaStream);

      const body = document.body;
      const videoElement = document.createElement("video");
      videoElement.srcObject = mediaStream;
      videoElement.autoplay = true;
      videoElement.style.position = "fixed";
      videoElement.style.top = 0;
      videoElement.style.left = 0;
      videoElement.style.visibility = "hidden";
      videoElement.setAttribute("data-html2canvas-ignore", "true");

      // videoElement.style.
      body.appendChild(videoElement);

      console.log("appended video element", videoElement);
    } catch (e) {
      console.error("error getting stream:", e);
    }
  });
}
