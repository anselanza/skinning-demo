import { loadSystem } from "./PoseDetection";

// Initialize button with user's preferred color
const startButton = document.getElementById("startButton");

// The key to doing this properly is: https://github.com/wpp/ScreenStream#you-might-not-need-this-anymore

// When the button is clicked, inject setPageBackgroundColor into current page
startButton.addEventListener("click", async () => {
  console.log("clicked! ready to get stream...");

  try {
    console.log("ask user for getDisplayMedia...");
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true,
    });
    const videoElement = document.getElementById("sourceVideo");
    if (videoElement) {
      videoElement.srcObject = stream;
    }
  } catch (e) {
    console.error("could not get stream:", e);
  }

  // chrome.desktopCapture.chooseDesktopMedia(["tab"], (streamId) => {
  //   console.log("got the streamId:", streamId);

  //   chrome.tabs.sendMessage(tab.id, { streamId }, function (response) {
  //     console.log({ response });

  //   });
  // });

  // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: startCapture,
  // });

  // chrome.desktopCapture.chooseDesktopMedia(["tab"], tab, async (streamId) => {
  //   console.log("started desktopCapture OK", streamId);
  //   //check whether the user canceled the request or not
  //   if (streamId && streamId.length) {
  //     console.warn("user cancelled request?");
  //   }

  //   setTimeout(() => {
  //     console.log("send streamId now...");
  //     chrome.tabs.sendMessage(tab.id, { streamId }, function (response) {
  //       console.log("sending message with ", { streamId });
  //       console.log({ response });
  //     });
  //   }, 1000);
  // });
});

// The body of this function will be executed as a content script inside the
// current page. OUTPUT WILL BE IN THE CURRENT PAGE (not the popup inspector)!
function startCapture() {
  console.log("startCapture content script running OK");
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log("got message from extension:", message, sender);

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

        // const videoElement = document.createElement("video");
        // videoElement.srcObject = mediaStream;
        // videoElement.autoplay = true;
        // videoElement.style.position = "position";
        // videoElement.style.top = 0;
        // videoElement.style.left = 0;
        // videoElement.style.visibility = "hidden";

        // outputContainer.setAttribute("data-html2canvas-ignore", "true");

        // outputContainer.appendChild(videoElement);
        // console.log("append DOM elements", { videoElement, outputContainer });
        // document.body.appendChild(outputContainer);

        // console.log("...DOM appending done");

        // try {
        //   await loadSystem(outputContainer, videoElement);
        // } catch (poseSystemError) {
        //   console.error(
        //     "error starting pose detection system:",
        //     poseSystemError
        //   );
        // }
        sendResponse();
      } catch (streamError) {
        console.error("error getting stream:", streamError);
      }
    }
  );
}
