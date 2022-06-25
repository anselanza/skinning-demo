// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
//@ts-ignore
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3, Object3D, Material, Bone, Quaternion, Matrix4 } from "three";
import { Keypoint, Pose } from "@tensorflow-models/pose-detection";

import { mappingCustomBlender } from "./JointsToBones";
import { remap } from "@anselan/maprange";
import { IDimensions, IPosition } from "./types";

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;

let rootModel: THREE.Object3D;
let containerElement: HTMLDivElement;

const transformSettings = {
  rotateModel: false,
  normalisePoints: {
    flipX: true,
    flipZ: false,
  },
  postCorrectRotation: 180,
  camera: {
    cameraFovRange: [8, 1],
    position: new Vector3(0, 3, -6),
    target: new Vector3(0, 0.8, 0),
  },
  render: {
    // Aim at a point much higher vertically (give space)
    // < 0.5 means more space below
    verticalRatio: 0.25,
  },
};

export const init = async (
  rootElement: HTMLElement
): Promise<{ rootObject: THREE.Group; scene: THREE.Scene }> =>
  new Promise((resolve, reject) => {
    containerElement = document.createElement("div");
    rootElement.appendChild(containerElement);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    containerElement.appendChild(renderer.domElement);
    containerElement.classList.add("render-container");

    camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.01
    );
    const { position, target } = transformSettings.camera;
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(target.x, target.y, target.z);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    // const grid = new THREE.GridHelper(10, 20, 0xffffff, 0xffffff);
    // (grid.material as Material).opacity = 0.25;
    // (grid.material as Material).depthWrite = false;
    // (grid.material as Material).transparent = true;
    // scene.add(grid);

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath("js/libs/basis/")
      .detectSupport(renderer);

    const loader = new GLTFLoader().setPath("/");
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load("./smooth-lowpoly.glb", function (gltf) {
      console.log("loaded:", gltf);

      const rootObject = gltf.scene;
      scene.add(rootObject);

      rootModel = rootObject.children[0];

      if (transformSettings.rotateModel === true) {
        rootObject.rotateY((180 * Math.PI) / 180);
        rootObject.updateWorldMatrix(true, true);
      }
      // rootObject.rotateX((-90 * Math.PI) / 180);
      const scale = 0.9;
      rootObject.scale.set(scale, scale, scale);
      scene.updateWorldMatrix(false, true);

      // render();
      resolve({ rootObject, scene });
    });

    // const controls = new OrbitControls(camera, renderer.domElement);
    // // controls.addEventListener("change", render); // use if there is no animation loop
    // controls.minDistance = 1;
    // controls.maxDistance = 20;
    // controls.target.set(0, 0, 0);
    // controls.update();

    // window.addEventListener("resize", onWindowResize);
  });

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);

//   // render();
// }

//

export function render(
  targetScreenPosition: IPosition,
  inputDimensions: IDimensions,
  bodySize: number
) {
  const { x, y } = targetScreenPosition;
  const { width, height } = inputDimensions;
  const [outputWidth, outputHeight] = [window.innerWidth, window.innerHeight];

  const [ratioWidth, ratioHeight] = [
    outputWidth / width,
    outputHeight / height,
  ];

  if (containerElement) {
    // Nose exactly halfway across the canvas horizontally...
    containerElement.style.left = `${(x - width / 2) * ratioWidth}px`;
    containerElement.style.top = `${
      (y - height * transformSettings.render.verticalRatio) * ratioHeight
    }px`;
  }

  // Zoom camera to try to match scale
  const scaleFov = remap(
    bodySize * ratioHeight,
    [0, outputHeight],
    transformSettings.camera.cameraFovRange
  );
  camera.fov = scaleFov;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
}

const normalisePoint = (
  kp: Keypoint,
  flipX = false,
  flipZ = false
): Vector3 => {
  const { x, y, z } = kp;
  if (z) {
    return new Vector3(flipX ? -x : x, -y + 0.2, flipZ ? -z : z);
  } else {
    return new Vector3(flipX ? -x : x, -y + 0.2, flipZ ? 0 : 0);
  }
};

export function drawPoseJoints(pose: Pose, rootElement: THREE.Group) {
  pose.keypoints3D?.forEach((kp) => {
    const radius = remap(kp.score || 1.0, [0, 1], [0, 0.05]);
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);

    const { x, y, z } = normalisePoint(kp, true);

    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    rootElement.add(sphere);
  });
  // }
}

const singleOrInterpolatedJoint = (
  matchingJoint: string | [string, string],
  pose: Pose
): Keypoint | undefined => {
  if (typeof matchingJoint === "string") {
    // Simple match on single corresponding joint...
    if (pose.keypoints3D) {
      return pose.keypoints3D.find((kp) => kp.name === matchingJoint);
    }
  } else {
    if (pose.keypoints3D && pose.score) {
      // Need to interpolate between the two keypoints given...
      const [p1, p2] = [
        pose.keypoints3D.find((kp) => kp.name === matchingJoint[0]),
        pose.keypoints3D.find((kp) => kp.name === matchingJoint[1]),
      ];
      if (p1 && p2) {
        const midpoint = new Vector3().lerpVectors(
          new Vector3(p1.x, p1.y, p1.z),
          new Vector3(p2.x, p2.y, p2.z),
          0.5
        );
        return {
          x: midpoint.x,
          y: midpoint.y,
          z: midpoint.z,
          name: `${p1.name}_${p2.name}`,
          score: (p1.score || 1 + (p2.score || 1)) / 2, // average of scores
        };
      }
    }
  }
};

export function bonesMatchPose(pose: Pose, rootElement: THREE.Group) {
  mappingCustomBlender.forEach((m) => {
    const targetBoneName = m.bone;

    const [matchingJointHead, matchingJointTail] = m.jointHeadTail;
    // console.log({ pose });

    const targetBone = rootElement.getObjectByName(targetBoneName) as Bone;
    if (targetBone) {
      if (targetBone.name === "mixamorig9Spine2") {
        // console.log("have spine; rotate 90 deg");
        // targetBone.rotateY((90 * Math.PI) / 180);
      }
      // console.log("found", { targetBone });

      const jointHead = singleOrInterpolatedJoint(matchingJointHead, pose);
      const jointTail = singleOrInterpolatedJoint(matchingJointTail, pose);

      if (jointHead && jointTail) {
        // console.log("found matching bone from joints", jointHead, jointTail);
        const { flipX, flipZ } = transformSettings.normalisePoints;
        pointBoneAtPosition(
          targetBone,
          normalisePoint(jointTail, flipX, flipZ),
          transformSettings.postCorrectRotation
        );
      } else {
        console.error(
          "could not find joint in pose with ends",
          jointHead,
          jointTail
        );
      }
    } else {
      console.error("could not find bone with name", targetBoneName);
    }
  });
  // Finally, rotate the whole model 180 degrees again
  rootElement.rotateY((180 * Math.PI) / 180);
}

function pointBoneAtPosition(
  bone: Bone,
  position: Vector3,
  correctRotation?: number
) {
  bone.updateWorldMatrix(true, false); // parents, not children
  const tempPosition = new Vector3();
  tempPosition.setFromMatrixPosition(bone.matrixWorld);

  const tmpMatrix = new Matrix4();
  tmpMatrix.lookAt(position, tempPosition, new Vector3(0, 1, 0));

  const rotateN = new Matrix4().makeRotationX((90 * Math.PI) / 180);
  tmpMatrix.multiply(rotateN);

  if (correctRotation) {
    const rotateFix = new Matrix4().makeRotationY(
      (correctRotation * Math.PI) / 180
    );
    tmpMatrix.multiply(rotateFix);
  }

  bone.quaternion.setFromRotationMatrix(tmpMatrix);

  const parent = bone.parent;
  if (parent) {
    tmpMatrix.extractRotation(parent.matrixWorld);

    // const rotateN2 = new Matrix4().makeRotationY((180 * Math.PI) / 180);
    // tmpMatrix.multiply(rotateN2);

    const tmpQuat = new Quaternion();
    tmpQuat.setFromRotationMatrix(tmpMatrix);

    bone.quaternion.premultiply(tmpQuat.invert());
  }

  // bone.lookAt(position);
}
