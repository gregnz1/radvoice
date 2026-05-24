import assert from "node:assert/strict";
import { formatDictation } from "../src/formatter.js";
import { templates } from "../src/templates.js";

const ctap = templates.find((template) => template.id === "ct-abdomen-pelvis");
const cthead = templates.find((template) => template.id === "ct-head");
const generic = templates.find((template) => template.id === "generic-report");
const ctchest = templates.find((template) => template.id === "ct-chest");
const ctpa = templates.find((template) => template.id === "ctpa");
const mribrain = templates.find((template) => template.id === "mri-brain");
const usabdo = templates.find((template) => template.id === "us-abdomen");

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

const genericResult = formatDictation(
  "indication abdominal pain technique ct performed findings no acute abnormality impression no acute abnormality",
  generic,
);

assert.match(genericResult.report, /Indication:\nAbdominal pain/);
assert.match(genericResult.report, /Technique:\nCt performed/);
assert.match(genericResult.report, /Findings:\nNo acute abnormality/);
assert.match(genericResult.report, /Impression:\nNo acute abnormality/);

const ctChestResult = formatDictation(
  "ct chest lungs clear no pleural effusion no pneumothorax mediastinum no lymphadenopathy heart size normal bones no acute osseous abnormality impression no acute cardiopulmonary abnormality",
  ctchest,
);

assert.match(ctChestResult.report, /CT CHEST/);
assert.match(ctChestResult.report, /Lungs: Clear lungs/);
assert.match(ctChestResult.report, /Mediastinum: No lymphadenopathy/);
assert.match(ctChestResult.report, /No acute cardiopulmonary abnormality/);

const ctpaResult = formatDictation(
  "ct pulmonary angiogram pulmonary arteries no pulmonary embolus lungs clear no pleural effusion no pneumothorax mediastinum no lymphadenopathy impression no pulmonary embolus",
  ctpa,
);

assert.match(ctpaResult.report, /CT PULMONARY ANGIOGRAM/);
assert.match(ctpaResult.report, /Pulmonary arteries: No pulmonary embolus/);
assert.match(ctpaResult.report, /No pulmonary embolus/);

const mriBrainResult = formatDictation(
  "mri brain no acute infarct no hemorrhage no mass effect ventricles normal no extra axial collection sinuses clear impression no acute intracranial abnormality",
  mribrain,
);

assert.match(mriBrainResult.report, /MRI BRAIN/);
assert.match(mriBrainResult.report, /Diffusion: No acute infarct/);
assert.match(mriBrainResult.report, /No acute intracranial abnormality/);

const ultrasoundResult = formatDictation(
  "ultrasound abdomen liver normal gallbladder absent bile ducts not dilated pancreas obscured spleen normal kidneys no hydronephrosis aorta normal impression no acute sonographic abnormality",
  usabdo,
);

assert.match(ultrasoundResult.report, /ABDOMINAL ULTRASOUND/);
assert.match(ultrasoundResult.report, /Biliary tree: No biliary dilatation/);
assert.match(ultrasoundResult.report, /No acute sonographic abnormality/);

const comparisonResult = formatDictation("comparison prior renal lesion mass impression follow up", ctap);

assert.ok(comparisonResult.flags.some((flag) => flag.category === "comparison"));
assert.ok(comparisonResult.flags.some((flag) => flag.category === "laterality"));
assert.ok(comparisonResult.flags.some((flag) => flag.category === "measurement"));

const siteResult = formatDictation("ct chest lesion impression follow up", ctchest);

assert.ok(siteResult.flags.some((flag) => flag.category === "site"));

const genericNoImpressionResult = formatDictation(
  "indication cough technique chest xray findings lungs clear",
  generic,
);

assert.ok(genericNoImpressionResult.flags.some((flag) => flag.category === "impression"));

console.log("formatter tests passed");
