import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as posedetection from "@tensorflow-models/pose-detection";

import { SupportedModels } from "@tensorflow-models/pose-detection";
import { bonesMatchPose, drawPoseJoints, init } from "./Render3D";

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

    const imageEl = document.getElementById("dummy-input") as HTMLImageElement;

    // Single pose detection on provided image:
    const poses = await detector.estimatePoses(imageEl, {
      flipHorizontal: false,
    });
    console.log("found", poses.length, "poses");

    const { rootObject, scene } = await init(rootElement);

    poses.forEach((p) => {
      drawPoseJoints(p, scene);
      bonesMatchPose(p, rootObject);
    });
  } catch (e) {
    console.error("Error starting system:", e);
  }
}
