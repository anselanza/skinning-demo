import path from "path";
import fs from "fs";
const { resolve } = require("path");
// import copy from "rollup-plugin-copy";

export default {
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "popup.html"),
      name: "BodyExtension",
      fileName: (format) => `extension.${format}.js`,
    },
  },

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
