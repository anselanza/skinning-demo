import { loadSystem } from "./PoseDetection";
import { init, render } from "./Render3D";

const main = async () => {
  loadSystem();
};

const detectionElement = document.getElementsByClassName;
if (detectionElement) {
  console.log("DOM ready");
  main();
} else {
  console.error("could not find app element");
}
