export const templates = [
  {
    id: "generic-report",
    name: "Generic Report",
    title: "RADIOLOGY REPORT",
    sections: ["Indication", "Technique", "Findings"],
    normalImpression: "No acute abnormality identified.",
    generic: true,
  },
  {
    id: "ct-abdomen-pelvis",
    name: "CT Abdomen/Pelvis",
    title: "CT ABDOMEN AND PELVIS",
    sections: [
      "Liver",
      "Gallbladder",
      "Pancreas",
      "Spleen",
      "Adrenals",
      "Kidneys",
      "Bowel",
      "Peritoneum",
      "Bones",
    ],
    normalImpression: "No acute intra-abdominal or pelvic abnormality.",
  },
  {
    id: "ct-head",
    name: "CT Head",
    title: "CT BRAIN",
    sections: [
      "Brain",
      "Ventricles",
      "Extra-axial spaces",
      "Calvarium",
      "Paranasal sinuses",
    ],
    normalImpression: "No acute intracranial abnormality.",
  },
  {
    id: "chest-xray",
    name: "Chest X-ray",
    title: "CHEST RADIOGRAPH",
    sections: ["Cardiomediastinal silhouette", "Lungs", "Pleura", "Bones"],
    normalImpression: "No acute cardiopulmonary abnormality.",
  },
];

export const samples = {
  ctap:
    "ct abdomen pelvis with contrast liver fine gallbladder removed pancreas normal spleen okay kidneys no hydronephrosis mild diverticular disease no obstruction no free air no free fluid bones no aggressive lesion impression nothing acute",
  cthead:
    "ct head no bleed no mass effect ventricles normal chronic small vessel change no skull fracture sinuses clear impression no acute intracranial abnormality",
  cxr:
    "chest xray heart size normal lungs clear no pleural effusion no pneumothorax no acute osseous abnormality impression no acute cardiopulmonary disease",
  generic:
    "indication pain technique ultrasound performed findings no focal abnormality impression no acute abnormality",
};
