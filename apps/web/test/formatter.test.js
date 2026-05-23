import assert from "node:assert/strict";
import { formatDictation } from "../src/formatter.js";
import { templates } from "../src/templates.js";

const ctap = templates.find((template) => template.id === "ct-abdomen-pelvis");
const cthead = templates.find((template) => template.id === "ct-head");

const abdomenResult = formatDictation(
  "ct abdomen pelvis liver fine gallbladder removed pancreas normal spleen okay kidneys no hydronephrosis mild diverticular disease no obstruction no free air no free fluid impression nothing acute",
  ctap,
);

assert.match(abdomenResult.report, /Liver: Unremarkable/);
assert.match(abdomenResult.report, /Gallbladder: Surgically absent/);
assert.match(abdomenResult.report, /No acute intra-abdominal or pelvic abnormality/);
assert.equal(
  abdomenResult.flags.some((flag) => flag.category === "laterality"),
  false,
);

const headResult = formatDictation(
  "ct head no bleed no mass effect chronic small vessel change ventricles normal impression no acute",
  cthead,
);

assert.match(headResult.report, /No acute intracranial hemorrhage/);
assert.match(headResult.report, /Chronic small vessel ischemic change/);
assert.match(headResult.report, /No acute intracranial abnormality/);

const flaggedResult = formatDictation("renal lesion mass", ctap);

assert.ok(flaggedResult.flags.some((flag) => flag.category === "laterality"));
assert.ok(flaggedResult.flags.some((flag) => flag.category === "measurement"));

const negatedLesionResult = formatDictation("bones no aggressive osseous lesion", ctap);

assert.equal(
  negatedLesionResult.flags.some((flag) => flag.category === "laterality"),
  false,
);
assert.equal(
  negatedLesionResult.flags.some((flag) => flag.category === "measurement"),
  false,
);

const privacyResult = formatDictation("patient name jane smith dob 01/02/1950 ct abdomen", ctap);

assert.ok(privacyResult.flags.some((flag) => flag.category === "privacy"));

console.log("formatter tests passed");
