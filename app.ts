// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3, Object3D, Material } from "three";

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
  camera.position.set(0, 0, -5);

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
    // coffeemat.glb was produced from the source scene using gltfpack:
    // gltfpack -i coffeemat/scene.gltf -o coffeemat.glb -cc -tc
    // The resulting model uses EXT_meshopt_compression (for geometry) and KHR_texture_basisu (for texture compression using ETC1S/BasisLZ)

    // gltf.scene.position.y = 8;
    const children = gltf.scene.children;
    console.log({ children });
    // const target = children.find((c) => c.name === "High");

    // target.children.forEach((c, index) => {
    //   c.visible = index === 0;
    // });

    const rootObject = gltf.scene;
    // const uniformScale = 100;
    // rootObject.scale.x = uniformScale;
    // rootObject.scale.y = uniformScale;
    // rootObject.scale.z = uniformScale;

    // console.log({ rootObject });
    scene.add(rootObject);

    // const targetBone = rootObject.children
    //   .find((c) => c.name === "Armature")
    //   .children.find((c) => c.type === "SkinnedMesh")
    //   .skeleton.bones.find((b) => b.name === "upper_arm_right")
    //   .children.find((c) => c.name === "lower_arm_right");
    // // .children.find((c) => c.name === "trunk_right")
    // // .children.find((c) => c.name === "upper_arm_right");
    const targetBone = findTargetBone(rootObject, "left_elbow-left_wrist");
    // const targetBone = findTargetBone(rootObject, "left_wrist");

    if (targetBone) {
      console.log({ targetBone });

      let tmpVector = new Vector3();
      const p = targetBone.getWorldPosition(tmpVector);

      console.log({ localPosition: targetBone.position, worldPosition: p });

      const targets = [
        {
          name: "boneHead", // head is at the root of the bone
          colour: 0xffff00,
          position: {
            x: p.x,
            y: p.y,
            z: p.z,
          },
        },
      ];

      targets.forEach((t) => {
        const { colour, position } = t;
        const geometry = new THREE.SphereGeometry(0.1, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: colour });
        const sphere = new THREE.Mesh(geometry, material);

        sphere.position.x = position.x;
        sphere.position.y = position.y;
        sphere.position.z = position.z;
        scene.add(sphere);
      });

      setInterval(() => {
        // targetBone.rotation.x = Math.random() * 3;
        // p.x += 0.5 - Math.random();
        render();
      }, 500);
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
