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
    },
  },

  plugins: [mediapipe_workaround()],
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
