import { loadDetector } from "./PoseDetection";
import { initScene } from "./Render3D";

const startButton = document.getElementById("startButton");

// The key to doing this properly is: https://github.com/wpp/ScreenStream#you-might-not-need-this-anymore
// Use getDisplayMedia NOT getUserMedia in this context

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
      const detector = await loadDetector();
    } else {
      console.error("could not find videoElement!");
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

        const outputContainer = document.createElement("div");
        outputContainer.style.position = "fixed";
        outputContainer.style.top = 0;
        outputContainer.style.left = 0;
        outputContainer.style.border = "1px solid red";

        outputContainer.setAttribute("data-html2canvas-ignore", "true");

        document.body.appendChild(outputContainer);

        console.log("output container appended to DOM");

        try {
          // const scene = await initScene(outputContainer);
        } catch (sceneError) {
          console.error("error initialising 3D scene", sceneError);
        }
        sendResponse();
      } catch (streamError) {
        console.error("error getting stream:", streamError);
      }
    }
  );
}
