import path from "path";
import fs from "fs";
// import copy from "rollup-plugin-copy";

export default {
  build: {
    outDir: "docs",
  },
  base: "https://anselanza.github.io/skinning-demo/",
  plugins: [
    mediapipe_workaround(),
    // copy({
    //   targets: [
    //     {
    //       src: [
    //         "./node_modules/@mediapipe/pose/*.wasm",
    //         "./node_modules/@mediapipe/pose/*.tflite",
    //         "./node_modules/@mediapipe/pose/*.binarypb",
    //         "./node_modules/@mediapipe/pose/*wasm_bin.js",
    //         "../../node_modules/@mediapipe/pose/*.wasm",
    //         "../../node_modules/@mediapipe/pose/*.tflite",
    //         "../../node_modules/@mediapipe/pose/*.binarypb",
    //         "../../node_modules/@mediapipe/pose/*wasm_bin.js",
    //       ],
    //       dest: "dist/",
    //     },
    //   ],
    // }),
  ],
};

// https://github.com/google/mediapipe/issues/2883 が本家で対応されるまでのワークアラウンド
function mediapipe_workaround() {
  return {
    name: "mediapipe_workaround",
    load(id) {
      if (path.basename(id) === "pose.js") {
        let code = fs.readFileSync(id, "utf-8");
        code += "exports.Pose = Pose;";
        return { code };
      } else {
        return null;
      }
    },
  };
}
