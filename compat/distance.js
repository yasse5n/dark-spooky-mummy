// Normal is a no-op so the approved 1.7.1 prompts remain byte-for-byte intact.
function buildCameraDistance() {
  var cameraDistance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "normal";
  var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var key = String(cameraDistance || "normal").trim();
  if (key === "normal") return null;
  var options = {
    close: {
      name: "CLOSE",
      framing: "Move the camera closer along the selected viewing direction. Make a clearly larger head-and-chest portrait than the normal waist-up frame. Keep the full head with a small top margin, show shoulders and upper chest, and crop before the waist. In a single-person frame, aim for a head width of roughly 30–36% of the frame width. Scale the whole upper body together, not just the head."
    },
    veryClose: {
      name: "VERY CLOSE",
      framing: "Move the camera substantially closer along the selected viewing direction. Make a tight full-head-and-shoulders portrait with only a small portion of upper chest; the face has unmistakably greater presence than the CLOSE option. In a single-person frame, aim for a head width of roughly 42–50% of the frame width. Keep the full hairline, ears and chin in frame, with natural facial proportions and no fisheye distortion. Do not restore a waist-up crop."
    },
    farther: {
      name: "SLIGHTLY FARTHER",
      framing: "Move the camera moderately back along the selected viewing direction. Make the person visibly smaller than in the normal framing, with wider background margins around the head and upper body. Use a wider waist-up portrait with a small amount of upper trousers at most; do not turn this into a knee-up or full-body photograph. Keep the face large enough to recognize and detailed."
    }
  };
  if (!Object.prototype.hasOwnProperty.call(options, key)) throw new Error("اختار بعد الشخص عن الكاميرا.");
  var choice = options[key];
  var group = count > 1 ? "This distance applies to the shared group camera. Keep the exact copy count and selected arrangement; in hero layout copy 1 stays largest. Scale the whole group relative to its normal framing, fitting every full head and active hand gesture. Single-person head-width targets do not apply separately to every copy." : "Keep the person the focal point and preserve normal head-to-body proportions.";
  return {
    key: key,
    framing: "".concat(choice.framing, " ").concat(group, " Preserve the selected body pose, gaze, expression and hand action. Keep an active hand gesture and held prop readable, allowing only the minimum extra framing they need without reverting to the normal crop."),
    instruction: "CAMERA DISTANCE \u2014 ".concat(choice.name, ": ").concat(choice.framing, " This control changes camera-to-subject distance and portrait scale ONLY. Preserve the selected camera height, orbit direction, tilt and visible angle cues, and keep pose and gaze independent. The selected distance crop takes priority over default waist-up framing in other presets or background descriptions. ").concat(group)
  };
}
function perspectiveForDistance(camera, distance) {
  if (!distance) return camera;
  return camera.replace("Recompose to keep the complete head and waist crop.", "Recompose to keep the complete head in the selected-distance crop.").replace("the entire head-to-waist portrait crop", "the selected-distance portrait crop").replace("Move the camera physically nearer and use", "Use").replace("reframe to include the complete head down to just below the waist", "reframe to follow the selected camera distance").replace("around the full head and waist crop", "around the full head and selected-distance crop");
}
function skyForDistance(sky, distance) {
  if (!sky || !distance) return sky;
  var adapted = Object.assign({}, sky, {
    framing: distance.framing
  });
  if (distance.key === "farther") {
    adapted.background = sky.background.replace("The person is large and dominant in the foreground.", "The person is framed at the selected slightly farther distance, with wider scenery margins, while remaining the focal point.");
  }
  if (distance.key !== "farther") {
    adapted.priority = sky.priority.replace("the lower abdomen and garment must progressively disappear into the street", "the bottom visible garment area must progressively blend into the foreground within the selected close crop");
    adapted.background = adapted.background.replace("Start at the mid-to-lower abdomen, below the opaque upper chest, and blend across the lower approximately 40–45% of each visible torso.", "Apply the lower fade only to the lowest visible garment area of the selected close crop, below the face and active hand gesture. Scale the transition to the visible clothing, never fade the face, neck, shoulders or a smaller copy's face.").replace("The belt, lower pockets, jacket hem and trousers must disappear fully into the paving, with no leftover opaque lower-body silhouette.", "Keep the waist, belt and trousers outside this close crop; do not zoom out to reveal them for the fade. Blend the bottom visible garment softly into the foreground.").replace("Complete the lower-body disappearance by approximately y = 80% of the full frame height, leaving the lowest 20% as clearly visible foreground ground rather than visible clothing.", "Place the lower garment blend near the bottom of the selected close composition; keep the close portrait large instead of reserving a fixed empty foreground band.").replace("Preserve the reference garment's recognizable details above the fade.", "Preserve the reference garment's recognizable details above the fade. Preserve the 66.67% sky / 33.33% ground division in the scenery behind the portrait; it must not change the selected portrait distance or create empty headroom.");
  }
  return adapted;
}
function roomForDistance(room, distance) {
  if (!room || !distance || distance.key !== "farther") return room;
  return room.replace("do not shrink the people or widen to a full-body shot to display the furniture", "use the selected slightly farther portrait scale, but do not widen beyond it or switch to a full-body shot to display the furniture");
}
if (typeof module !== "undefined") module.exports = {
  buildCameraDistance: buildCameraDistance,
  perspectiveForDistance: perspectiveForDistance,
  skyForDistance: skyForDistance,
  roomForDistance: roomForDistance
};
