interface J2BMap {
  jointHeadTail: [string, string] | [[string, string], [string, string]];
  bone: string;
}

// See MediaPipe Blazepose 3d joint schema:
// https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d

// Notes:
// - All bone names must have : symbols removed in this map

export const mappingMixamo: J2BMap[] = [
  // Left arm
  {
    jointHeadTail: ["left_shoulder", "left_elbow"],
    bone: "mixamorig9LeftArm",
  },
  {
    jointHeadTail: ["left_elbow", "left_wrist"],
    bone: "mixamorig9LeftForeArm",
  },

  // Right arm
  {
    jointHeadTail: ["right_shoulder", "right_elbow"],
    bone: "mixamorig9RightArm",
  },
  {
    jointHeadTail: ["right_elbow", "right_wrist"],
    bone: "mixamorig9RightForeArm",
  },

  // Left Leg
  {
    jointHeadTail: ["left_hip", "left_knee"],
    bone: "mixamorig9LeftUpLeg",
  },
  {
    jointHeadTail: ["left_knee", "left_ankle"],
    bone: "mixamorig9LeftLeg",
  },

  // Right Leg
  {
    jointHeadTail: ["right_hip", "right_knee"],
    bone: "mixamorig9RightUpLeg",
  },
  {
    jointHeadTail: ["right_knee", "right_ankle"],
    bone: "mixamorig9RightLeg",
  },

  // Spine,
  // interpolated from midpoint hips to midpoint shoulders
  {
    jointHeadTail: [
      ["left_hip", "right_hip"],
      ["left_shoulder", "right_shoulder"],
    ],
    bone: "mixamorig9Spine2",
  },
];

export const mappingCustomBlender: J2BMap[] = [
  // Left arm
  {
    jointHeadTail: ["left_shoulder", "left_elbow"],
    bone: "left_upper_arm",
  },
  {
    jointHeadTail: ["left_elbow", "left_wrist"],
    bone: "left_lower_arm",
  },

  // Right arm
  {
    jointHeadTail: ["right_shoulder", "right_elbow"],
    bone: "right_upper_arm",
  },
  {
    jointHeadTail: ["right_elbow", "right_wrist"],
    bone: "right_lower_arm",
  },

  // Spine,
  // interpolated from midpoint hips to midpoint shoulders
  {
    jointHeadTail: [
      ["left_hip", "right_hip"],
      ["left_shoulder", "right_shoulder"],
    ],
    bone: "spine",
  },

  {
    jointHeadTail: [
      ["right_shoulder", "left_shoulder"],
      ["mouth_right", "mouth_left"],
    ],
    bone: "neck",
  },
];
