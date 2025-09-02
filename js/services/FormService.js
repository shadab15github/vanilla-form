const FormService = {
  formData: {
    separateAnnexe: "no",
    caravanPrice: "10000",
    annexePrice: "",
    purchasePrice: "",
  },

  currentStep: 1,

  getFormData() {
    return FormService.formData;
  },

  updateFormData(name, value) {
    // Only allow numbers for price fields
    if (
      name === "caravanPrice" ||
      name === "annexePrice" ||
      name === "purchasePrice"
    ) {
      const numericValue = value.replace(/[^0-9]/g, "");
      FormService.formData[name] = numericValue;
    } else {
      FormService.formData[name] = value;
    }
  },

  getCurrentStep() {
    return FormService.currentStep;
  },

  setCurrentStep(step) {
    FormService.currentStep = step;
  },

  getTotalSteps() {
    return formConfig.steps.length;
  },

  getCurrentStepConfig() {
    return formConfig.steps.find((step) => step.id === FormService.currentStep);
  },

  submitForm() {
    console.log("Form submitted:", FormService.formData);
    alert("Form submitted successfully!");
  },
};
