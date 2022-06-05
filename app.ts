import { loadSystem } from "./PoseDetection";

const main = async (rootElement: HTMLElement) => {
  loadSystem(rootElement);
};

const rootElement = document.getElementsByClassName("app")[0] as HTMLElement;
if (rootElement) {
  console.log("DOM ready");
  main(rootElement);
} else {
  console.error("could not find app element");
}
