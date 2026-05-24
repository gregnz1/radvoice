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
  {
    id: "ct-chest",
    name: "CT Chest",
    title: "CT CHEST",
    sections: ["Lungs", "Pleura", "Mediastinum", "Heart", "Bones"],
    normalImpression: "No acute cardiopulmonary abnormality.",
  },
  {
    id: "ctpa",
    name: "CT Pulmonary Angiogram",
    title: "CT PULMONARY ANGIOGRAM",
    sections: ["Pulmonary arteries", "Lungs", "Pleura", "Mediastinum", "Heart", "Bones"],
    normalImpression: "No pulmonary embolus. No acute cardiopulmonary abnormality.",
  },
  {
    id: "mri-brain",
    name: "MRI Brain",
    title: "MRI BRAIN",
    sections: ["Brain", "Ventricles", "Extra-axial spaces", "Diffusion", "Bones", "Paranasal sinuses"],
    normalImpression: "No acute intracranial abnormality.",
  },
  {
    id: "us-abdomen",
    name: "Ultrasound Abdomen",
    title: "ABDOMINAL ULTRASOUND",
    sections: ["Liver", "Gallbladder", "Biliary tree", "Pancreas", "Spleen", "Kidneys", "Aorta"],
    normalImpression: "No acute sonographic abnormality.",
  },
];

export const phrasePreferences = {
  noAcuteIntracranial: "No acute intracranial abnormality.",
  noAcuteCardiopulmonary: "No acute cardiopulmonary abnormality.",
  noPulmonaryEmbolus: "No pulmonary embolus.",
  noAcuteAbdomenPelvis: "No acute intra-abdominal or pelvic abnormality.",
};

export const samples = {
  ctap:
    "ct abdomen pelvis with contrast liver fine gallbladder removed pancreas normal spleen okay kidneys no hydronephrosis mild diverticular disease no obstruction no free air no free fluid bones no aggressive lesion impression nothing acute",
  cthead:
    "ct head no bleed no mass effect ventricles normal chronic small vessel change no skull fracture sinuses clear impression no acute intracranial abnormality",
  cxr:
    "chest xray heart size normal lungs clear no pleural effusion no pneumothorax no acute osseous abnormality impression no acute cardiopulmonary disease",
  generic:
    "indication pain technique ultrasound performed findings no focal abnormality impression no acute abnormality",
  ctchest:
    "ct chest lungs clear no pleural effusion no pneumothorax mediastinum no lymphadenopathy heart size normal bones no acute osseous abnormality impression no acute cardiopulmonary abnormality",
  ctpa:
    "ct pulmonary angiogram pulmonary arteries no pulmonary embolus lungs clear no pleural effusion no pneumothorax mediastinum no lymphadenopathy heart size normal impression no pulmonary embolus no acute cardiopulmonary abnormality",
  mribrain:
    "mri brain no acute infarct no hemorrhage no mass effect ventricles normal no extra axial collection sinuses clear impression no acute intracranial abnormality",
  usabdo:
    "ultrasound abdomen liver normal gallbladder absent bile ducts not dilated pancreas obscured spleen normal kidneys no hydronephrosis aorta normal impression no acute sonographic abnormality",
  ambiguity:
    "ct abdomen comparison prior renal lesion mass impression lesion for follow up",
};
