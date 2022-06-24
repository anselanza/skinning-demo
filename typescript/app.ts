import { loadSystem } from "./PoseDetection";
import "./app.scss";

const main = async (rootElement: HTMLElement) => {
  const videoElement = document.getElementById(
    "inputSource"
  ) as HTMLVideoElement;
  if (videoElement && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        videoElement.srcObject = stream;
        loadSystem(rootElement, videoElement);
      })
      .catch(function (error) {
        console.log("error starting video stream:", error);
      });
  }
};

const rootElement = document.getElementsByClassName("app")[0] as HTMLElement;
if (rootElement) {
  console.log("DOM ready");

  main(rootElement);
} else {
  console.error("could not find app element");
}
