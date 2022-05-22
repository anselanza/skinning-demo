interface J2BMap {
  jointHeadTail: [string, string];
  bone: string;
}

export const mapping: J2BMap[] = [
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
];
