interface J2BMap {
  jointHeadTail: [string, string];
  bone: string;
}

export const mapping: J2BMap[] = [
  {
    jointHeadTail: ["left_shoulder", "left_elbow"],
    bone: "mixamorig9LeftArm",
  },
  {
    jointHeadTail: ["left_elbow", "left_wrist"],
    bone: "mixamorig9LeftForeArm",
  },
  {
    jointHeadTail: ["right_shoulder", "right_elbow"],
    bone: "mixamorig9RightArm",
  },
  {
    jointHeadTail: ["right_elbow", "right_wrist"],
    bone: "mixamorig9RightForeArm",
  },
];
