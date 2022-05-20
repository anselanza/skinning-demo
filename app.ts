import { init, render } from "./Render3D";

const appElement = document.getElementsByClassName("app");
if (appElement) {
  console.log("DOM ready");
  init();
  render();
} else {
  console.error("could not find app element");
}
