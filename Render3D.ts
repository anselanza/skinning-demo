// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3, Object3D, Material, Bone, Quaternion, Matrix4 } from "three";
import { Keypoint, Pose } from "@tensorflow-models/pose-detection";

import { mappingCustomBlender } from "./JointsToBones";
import { remap } from "@anselan/maprange";

let camera, scene, renderer;

function findTargetBone(obj: Object3D, targetName: string): Object3D | null {
  if (obj.name === targetName) {
    console.log("found it!", obj);
    return obj;
  } else {
    if (obj.children === undefined || obj.children.length === 0) {
      return undefined;
    }

    const inMyChildren =
      obj.children !== undefined
        ? obj.children.find((c) => findTargetBone(c, targetName))
        : undefined;
    console.log({ myChildren: obj.children, inMyChildren, me: obj.name });
    if (inMyChildren === undefined) {
      return undefined;
    } else {
      return findTargetBone(inMyChildren, targetName);
    }
  }
}

export const init = async (
  rootElement: HTMLElement
): Promise<{ rootObject: THREE.Group; scene: THREE.Group }> =>
  new Promise((resolve, reject) => {
    const container = document.createElement("div");
    rootElement.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01
    );
    camera.position.set(-2, 3, -1);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbbbbb);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    const grid = new THREE.GridHelper(10, 20, 0xffffff, 0xffffff);
    (grid.material as Material).opacity = 0.5;
    (grid.material as Material).depthWrite = false;
    (grid.material as Material).transparent = true;
    scene.add(grid);

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath("js/libs/basis/")
      .detectSupport(renderer);

    const loader = new GLTFLoader().setPath("/");
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load("smooth-lowpoly.glb", function (gltf) {
      console.log("loaded:", gltf);

      const rootObject = gltf.scene;
      scene.add(rootObject);

      // rootObject.rotateY((180 * Math.PI) / 180);
      // rootObject.rotateX((-90 * Math.PI) / 180);
      const scale = 0.95;
      rootObject.scale.set(scale, scale, scale);
      scene.updateWorldMatrix();

      render();
      resolve({ rootObject, scene });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use if there is no animation loop
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);
    controls.update();

    window.addEventListener("resize", onWindowResize);
  });

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

export function render() {
  renderer.render(scene, camera);
}

const normalisePoint = (
  kp: Keypoint,
  flipX = false,
  flipY = false
): Vector3 => {
  const { x, y, z } = kp;
  return new Vector3(flipX ? -x : x, -y + 0.2, flipY ? -z : z);
};

export function drawPoseJoints(pose: Pose, rootElement: THREE.Group) {
  pose.keypoints3D.forEach((kp) => {
    const radius = remap(kp.score, [0, 1], [0, 0.05]);
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);

    const { x, y, z } = normalisePoint(kp, true);

    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    rootElement.add(sphere);
  });
}

const singleOrInterpolatedJoint = (
  matchingJoint: string | [string, string],
  pose: Pose
): Keypoint => {
  if (typeof matchingJoint === "string") {
    // Simple match on single corresponding joint...
    return pose.keypoints3D.find((kp) => kp.name === matchingJoint);
  } else {
    // Need to interpolate between the two keypoints given...
    const [p1, p2] = [
      pose.keypoints3D.find((kp) => kp.name === matchingJoint[0]),
      pose.keypoints3D.find((kp) => kp.name === matchingJoint[1]),
    ];
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
      score: (p1.score + p2.score) / 2, // average of scores
    };
  }
};

export function bonesMatchPose(pose: Pose, rootElement: THREE.Group) {
  mappingCustomBlender.forEach((m) => {
    const targetBoneName = m.bone;

    const [matchingJointHead, matchingJointTail] = m.jointHeadTail;
    console.log({ pose });

    const targetBone = rootElement.getObjectByName(targetBoneName) as Bone;
    if (targetBone) {
      if (targetBone.name === "mixamorig9Spine2") {
        console.log("have spine; rotate 90 deg");
        // targetBone.rotateY((90 * Math.PI) / 180);
      }
      console.log("found", { targetBone });

      const jointHead = singleOrInterpolatedJoint(matchingJointHead, pose);
      const jointTail = singleOrInterpolatedJoint(matchingJointTail, pose);

      if (jointHead && jointTail) {
        console.log("found matching bone from joints", jointHead, jointTail);
        pointBoneAtPosition(targetBone, normalisePoint(jointTail, false, true));
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

function moveBoneHeadToPosition(bone: Bone, position: Vector3) {
  const localPosition = bone.worldToLocal(position);
  bone.position.set(localPosition.x, localPosition.y, localPosition.z);
  // bone.position.set(position.x, position.y, position.z);
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
