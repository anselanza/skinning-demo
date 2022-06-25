import { dummyLog, loadSystem } from "./PoseDetection";

const startButton = document.getElementById("startButton");

startButton.addEventListener("click", async () => {
  console.log("clicked!");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.desktopCapture.chooseDesktopMedia(["tab"], tab, async (streamId) => {
    console.log("started desktopCapture OK", streamId);
    //check whether the user canceled the request or not
    if (streamId && streamId.length) {
      console.warn("user cancelled request?");
    }
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: streamId,
        },
      },
    });
    console.log("stream OK:", mediaStream);

    const inputContainer = document.getElementById("inputContainer");

    const videoElement = document.createElement("video");
    videoElement.srcObject = mediaStream;
    videoElement.autoplay = true;
    videoElement.style.position = "position";
    videoElement.style.top = 0;
    videoElement.style.left = 0;
    videoElement.style.width = "10%";
    // videoElement.style.visibility = "hidden";

    // inputContainer.setAttribute("data-html2canvas-ignore", "true");

    inputContainer.appendChild(videoElement);
    console.log("append DOM elements", { videoElement, inputContainer });
    document.body.appendChild(inputContainer);
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startCapture,
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

      // const outputContainer = document.createElement("div");
      // outputContainer.style.position = "fixed";
      // outputContainer.style.top = 0;
      // outputContainer.style.left = 0;
      // outputContainer.style.border = "1px solid red";

      const videoElement = document.createElement("video");
      videoElement.srcObject = mediaStream;
      videoElement.autoplay = true;
      videoElement.style.position = "position";
      videoElement.style.top = 0;
      videoElement.style.left = 0;
      videoElement.style.visibility = "hidden";

      outputContainer.setAttribute("data-html2canvas-ignore", "true");

      outputContainer.appendChild(videoElement);
      console.log("append DOM elements", { videoElement, outputContainer });
      document.body.appendChild(outputContainer);

      console.log("...DOM appending done");

      // try {
      //   await loadSystem(outputContainer, videoElement);
      // } catch (poseSystemError) {
      //   console.error("error starting pose detection system:", poseSystemError);
      // }
    } catch (streamError) {
      console.error("error getting stream:", streamError);
    }
  });
}
