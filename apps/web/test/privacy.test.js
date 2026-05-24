import assert from "node:assert/strict";
import { detectPatientIdentifiers, redactPatientIdentifiers } from "../src/privacy.js";

const text =
  "patient name Jane Smith dob 01/02/1950 indication cough findings lungs clear impression normal";
const detections = detectPatientIdentifiers(text);

assert.ok(detections.some((item) => item.category === "patient-name"));
assert.ok(detections.some((item) => item.category === "dob"));

const redacted = redactPatientIdentifiers(text);

assert.equal(redacted.redacted, true);
assert.match(redacted.text, /\[REDACTED PATIENT-NAME\]/);
assert.match(redacted.text, /\[REDACTED DOB\]/);
assert.match(redacted.text, /indication cough/);
assert.doesNotMatch(redacted.text, /Jane Smith/i);
assert.doesNotMatch(redacted.text, /01\/02\/1950/);

console.log("privacy tests passed");

