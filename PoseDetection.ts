import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as posedetection from "@tensorflow-models/pose-detection";

import { SupportedModels } from "@tensorflow-models/pose-detection";
import { bonesMatchPose, drawPoseJoints, init, render } from "./Render3D";

async function createDetector() {
  return posedetection.createDetector(SupportedModels.BlazePose, {
    runtime: "mediapipe",
    // modelType: posedetection.movenet.modelType.MULTIPOSE_LIGHTNING,
    // modelType: "heavy",
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
  });
}

export async function loadSystem(rootElement: HTMLElement) {
  try {
    // const skinnedPose = new SkinnedPose(rootElement);

    const detector = await createDetector();
    console.info("detector loaded OK, wait for start");

    const inputElement = document.getElementById(
      "dummy-input"
    ) as HTMLVideoElement;

    const { rootObject, scene } = await init(rootElement);

    const tick = async (_time: number) => {
      const poses = await detector.estimatePoses(inputElement, {
        flipHorizontal: false,
      });

      poses.forEach((p) => {
        // drawPoseJoints(p, scene);
        bonesMatchPose(p, rootObject);

        // const normKeypoints =
        //   posedetection.calculators.keypointsToNormalizedKeypoints(
        //     p.keypoints,
        //     inputElement
        //   );

        const [width, height] = [
          inputElement.videoWidth,
          inputElement.videoHeight,
        ];

        const target = p.keypoints.find((k) => k.name === "nose");

        const [size1, size2] = [
          p.keypoints.find((k) => k.name === "left_shoulder"),
          p.keypoints.find((k) => k.name === "left_hip"),
        ];
        const bodySize = Math.abs(size1.y - size2.y);

        if (target) {
          render({ x: target.x, y: target.y }, { width, height }, bodySize);
        }
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } catch (e) {
    console.error("Error starting system:", e);
  }
}
