import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as posedetection from "@tensorflow-models/pose-detection";

import { SupportedModels } from "@tensorflow-models/pose-detection";

async function createDetector() {
  return posedetection.createDetector(SupportedModels.BlazePose, {
    runtime: "mediapipe",
    // modelType: posedetection.movenet.modelType.MULTIPOSE_LIGHTNING,

    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
  });
}

export async function loadSystem(rootElement: HTMLElement) {
  try {
    // const skinnedPose = new SkinnedPose(rootElement);

    const detector = await createDetector();
    console.info("detector loaded OK, wait for start");
  } catch (e) {
    console.error("Error starting system:", e);
  }
}
