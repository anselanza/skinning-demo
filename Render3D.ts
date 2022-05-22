// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3, Object3D, Material, Bone, Quaternion, Matrix4 } from "three";
import { Keypoint, Pose } from "@tensorflow-models/pose-detection";

import { mapping } from "./JointsToBones";

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

export const init = async (rootElement: HTMLElement): Promise<THREE.Group> =>
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

    loader.load("from-mixamo.glb", function (gltf) {
      console.log("loaded:", gltf);

      const rootObject = gltf.scene;
      scene.add(rootObject);

      // rootObject.rotateY((180 * Math.PI) / 180);
      const scale = 0.9;
      rootObject.scale.set(-scale, scale, -scale);
      scene.updateWorldMatrix();

      render();
      resolve(rootObject);
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

const normalisePoint = (kp: Keypoint): Vector3 => {
  const { x, y, z } = kp;
  return new Vector3(x, -y + 0.9, z);
};

export function drawPoseJoints(pose: Pose, rootElement: THREE.Group) {
  pose.keypoints3D.forEach((kp) => {
    const geometry = new THREE.SphereGeometry(0.05, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);

    const { x, y, z } = normalisePoint(kp);

    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    rootElement.add(sphere);
  });
}

export function bonesMatchPose(pose: Pose, rootElement: THREE.Group) {
  mapping.forEach((m) => {
    const targetBoneName = m.bone;

    const [jointHead, jointTail] = m.jointHeadTail;
    console.log({ pose });

    const targetBone = rootElement.getObjectByName(targetBoneName) as Bone;
    if (targetBone) {
      console.log("found", { targetBone });

      const srcJointHead = pose.keypoints3D.find((kp) => kp.name === jointHead);
      const srcJointTail = pose.keypoints3D.find((kp) => kp.name === jointTail);

      if (srcJointHead && srcJointTail) {
        console.log(
          "found matching bone from joins",
          srcJointHead,
          srcJointTail
        );
        boneLookAtWorld(targetBone, normalisePoint(srcJointTail));
      } else {
        console.error(
          "could not find joint in pose with ends",
          srcJointHead,
          srcJointTail
        );
      }
    } else {
      console.error("could not find bone with name", targetBoneName);
    }
  });
}

function boneLookAtWorld(bone: Bone, position: Vector3) {
  bone.updateWorldMatrix(true, false); // parents, not children
  const tempPosition = new Vector3();
  tempPosition.setFromMatrixPosition(bone.matrixWorld);

  const tmpMatrix = new Matrix4();
  tmpMatrix.lookAt(position, tempPosition, new Vector3(0, 1, 0));

  const rotateN = new Matrix4().makeRotationX((90 * Math.PI) / 180);
  tmpMatrix.multiply(rotateN);

  bone.quaternion.setFromRotationMatrix(tmpMatrix);

  const parent = bone.parent;
  if (parent) {
    tmpMatrix.extractRotation(parent.matrixWorld);
    const tmpQuat = new Quaternion();
    tmpQuat.setFromRotationMatrix(tmpMatrix);
    bone.quaternion.premultiply(tmpQuat.invert());
  }

  // bone.lookAt(position);
}
