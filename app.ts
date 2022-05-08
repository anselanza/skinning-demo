// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3, Object3D, Material, Bone } from "three";

let camera, scene, renderer;

init();
render();

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

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight
  );
  camera.position.set(0, 1, -5);

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
  loader.load("jacket_with_bones.glb", function (gltf) {
    console.log("loaded:", gltf);

    // const children = gltf.scene.children;
    // console.log({ children });

    const rootObject = gltf.scene;
    scene.add(rootObject);

    rootObject.rotateY((180 * Math.PI) / 180);
    scene.updateWorldMatrix();

    const [targetBoneA, targetBoneB] = [
      findTargetBone(rootObject, "left_elbow-left_wrist"),
      findTargetBone(rootObject, "left_wrist"),
    ];

    if (targetBoneA && targetBoneB) {
      console.log({ targetBoneA, targetBoneB });

      // let tmpVector = new Vector3();
      const [worldPositionA, worldPositionB] = [
        targetBoneA.getWorldPosition(new Vector3()),
        targetBoneB.getWorldPosition(new Vector3()),
      ];

      const originalWristPosition = { ...targetBoneB.position };

      console.log({
        localPosition: targetBoneA.position,
        worldPosition: worldPositionA,
      });

      const targets = [
        {
          name: "boneHead", // head is at the root of the bone
          colour: 0xffff00,
          position: {
            x: worldPositionA.x,
            y: worldPositionA.y,
            z: worldPositionA.z,
          },
        },
        {
          name: "tailPositionA", // ORIGINAL wrist join position
          colour: 0xff0000,
          position: {
            x: worldPositionB.x,
            y: worldPositionB.y,
            z: worldPositionB.z,
          },
        },
        {
          name: "tailPositionB", // NEW wrist join position
          colour: 0x00ff00,
          position: {
            x: worldPositionB.x + 0.1,
            y: worldPositionB.y + 0.2,
            z: worldPositionB.z - 0.2,
          },
        },
      ];

      targets.forEach((t) => {
        const { colour, position, name } = t;
        const geometry = new THREE.SphereGeometry(0.05, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: colour });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.x = position.x;
        sphere.position.y = position.y;
        sphere.position.z = position.z;
        scene.add(sphere);

        console.log("added target sphere", { name, colour, position });
      });

      let index = 0;

      setInterval(() => {
        index++;
        if (index % 2 === 0) {
          // targetBoneA.rotateX(Math.random() * 1);
          // targetBoneA.lookAt(new Vector3());

          // targetBoneA.lookAt(0, 0, 0);

          const targetSphere = targets.find((t) => t.name === "tailPositionA");
          const { x, y, z } = targetSphere.position;

          targetBoneA.lookAt(new Vector3(x, y, z));

          // boneLookAtLocal(targetBoneA as Bone, new Vector3(0, 0, 0));
        } else {
          const targetSphere = targets.find((t) => t.name === "tailPositionB");
          const { x, y, z } = targetSphere.position;
          // boneLookAtLocal(targetBoneA as Bone, new Vector3(x, y, z));
          const parent = targetBoneA.parent;
          // parent.remove(targetBoneA);
          // scene.attach(targetBoneA);
          // console.log({ parent });
          // targetBoneA.updateMatrixWorld();
          // console.log("parent quat", parent.quaternion);

          const parentDirection = parent.getWorldDirection(new Vector3());
          const myDirection = targetBoneA.getWorldDirection(new Vector3());
          // console.log({ parentDirection, myDirection });

          targetBoneA.lookAt(new Vector3(x, y, z));

          // targetBoneA.applyQuaternion(parent.quaternion);

          // parent.attach(targetBoneA);
        }

        render();
      }, 1000);
    } else {
      console.error("couldn't find targetBone");
    }

    render();
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 1;
  controls.maxDistance = 20;
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

//

function render() {
  renderer.render(scene, camera);
}

// function boneLookAtLocal(bone: Bone, position: Vector3) {
//   bone.updateMatrixWorld();
//   let direction = position.clone().normalize();
//   let pitch = Math.asin(-direction.y); // + bone.offset
//   let yaw = Math.atan2(direction.x, direction.z); //Beware cos(pitch)==0, catch this exception!
//   let roll = Math.PI;
//   bone.rotation.set(roll, yaw, pitch);
// }

// function boneLookAtWorld(bone, v) {
//   const parent = bone.parent;
//   scene.attach(bone);
//   boneLookAtLocal(bone, v);
//   parent.attach(bone);
// }
