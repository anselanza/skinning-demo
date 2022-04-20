// three/examples/jsm/

import * as THREE from "three";

import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Vector3 } from "three";

let camera, scene, renderer;

init();
render();

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
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.set(0, 100, 0);

  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbbbbbb);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  const grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
  grid.material.opacity = 0.5;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
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
    const uniformScale = 100;
    rootObject.scale.x = uniformScale;
    rootObject.scale.y = uniformScale;
    rootObject.scale.z = uniformScale;

    console.log({ rootObject });
    scene.add(rootObject);

    const targetBone = rootObject.children
      .find((c) => c.name === "Armature")
      .children.find((c) => c.type === "SkinnedMesh")
      .skeleton.bones.find((b) => b.name === "upper_arm_right");
    // .children.find((c) => c.name === "trunk_right")
    // .children.find((c) => c.name === "upper_arm_right");
    // .children.find((c) => c.name === "lower_arm_right");

    if (targetBone) {
      console.log({ targetBone });
      setInterval(() => {
        targetBone.rotation.x = Math.random() * 3;
        render();
      }, 500);
    } else {
      console.error("couldn't find targetBone");
    }

    render();
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 400;
  controls.maxDistance = 1000;
  controls.target.set(10, 90, -16);
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
