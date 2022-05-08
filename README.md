Similar approach:
https://discourse.threejs.org/t/need-help-figuring-out-bone-rotations-please-help/29059/12

So far, `lookAt` rotates the bone to "a position that doesn't really make sense" except that perhaps it does not have the correct relation between parent(s)' positions and rotations. Since `lookAt` assumes a World Position to point to, perhaps it makes sense to either follow the approach above (attach to scene root, point, then re-attach to parent) or get all transformations so far (either recursively, or simply using some "local to world" built-in function already provided) and then recalculate a direction/lookAt vector?
