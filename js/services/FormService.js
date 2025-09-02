// js/services/FormService.js
const FormService = {
  formData: {},
  currentStep: 1,
  isOnline: true,
  currentFormId: null,
  sessionId: null,

  // Generate a unique session ID for the form
  generateSessionId() {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Initialize form with default values and create new entry in IndexedDB
  async initializeForm() {
    FormService.formData = {
      separateAnnexe: "no",
      caravanPrice: "",
      annexePrice: "",
      purchasePrice: "",
    };
    FormService.currentStep = 1;
    FormService.currentFormId = null;
    FormService.sessionId = FormService.generateSessionId();

    // Create a new form entry in IndexedDB
    try {
      const formId = await IndexDBService.createForm(FormService.sessionId);
      FormService.currentFormId = formId;
      console.log("New form initialized with ID:", formId);
    } catch (error) {
      console.error("Failed to create form in IndexedDB:", error);
    }
  },

  getFormData() {
    return FormService.formData;
  },

  async updateFormData(name, value) {
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

    // Update the existing form in IndexedDB (don't create new entry)
    if (FormService.currentFormId) {
      try {
        await IndexDBService.updateForm(
          FormService.currentFormId,
          FormService.formData,
          FormService.currentStep,
          false
        );
      } catch (error) {
        console.error("Failed to update form in IndexedDB:", error);
      }
    }
  },

  getCurrentStep() {
    return FormService.currentStep;
  },

  async setCurrentStep(step) {
    FormService.currentStep = step;

    // Update the existing form in IndexedDB when step changes
    if (FormService.currentFormId) {
      try {
        await IndexDBService.updateForm(
          FormService.currentFormId,
          FormService.formData,
          FormService.currentStep,
          false // not complete yet
        );
      } catch (error) {
        console.error("Failed to update form step in IndexedDB:", error);
      }
    }
  },

  getTotalSteps() {
    return formConfig.steps.length;
  },

  getCurrentStepConfig() {
    return formConfig.steps.find((step) => step.id === FormService.currentStep);
  },

  getIsOnline() {
    return FormService.isOnline;
  },

  setIsOnline(value) {
    FormService.isOnline = value;
    console.log(`Online status changed to: ${value}`);
  },

  getCurrentFormId() {
    return FormService.currentFormId;
  },

  setCurrentFormId(id) {
    FormService.currentFormId = id;
  },

  async submitForm() {
    console.log("Form submitted:", FormService.formData);

    if (FormService.isOnline) {
      // Online mode: Submit to server and remove from IndexedDB
      try {
        // Simulate API call
        await FormService.submitToServer(FormService.formData);

        // Remove from IndexedDB after successful submission
        if (FormService.currentFormId) {
          await IndexDBService.deleteForm(FormService.currentFormId);
        }

        alert("Form submitted successfully (Online)!");

        // Clear form and initialize a new one
        await FormService.clearAndResetForm();
      } catch (error) {
        console.error("Failed to submit form online:", error);
        alert("Failed to submit form. Please try again.");
      }
    } else {
      // Offline mode: Mark form as complete in IndexedDB
      try {
        if (FormService.currentFormId) {
          await IndexDBService.updateForm(
            FormService.currentFormId,
            FormService.formData,
            FormService.currentStep,
            true // mark as complete
          );
        }

        alert(
          "Form saved successfully (Offline)! It will be submitted when you're back online."
        );

        // Clear form and initialize a new one for next entry
        await FormService.clearAndResetForm();
      } catch (error) {
        console.error("Failed to save form offline:", error);
        alert("Failed to save form. Please try again.");
      }
    }
  },

  // Simulate server submission
  async submitToServer(data) {
    // This would be your actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Submitting to server:", data);
        resolve({ success: true });
      }, 1000);
    });
  },

  // Clear current form and prepare for new entry
  async clearAndResetForm() {
    // Initialize a new form (creates new IndexedDB entry)
    await FormService.initializeForm();

    // Re-render the form
    const app = document.getElementById("app");
    if (app && typeof VanillaForm !== "undefined") {
      VanillaForm.render(app);
    }
  },

  // Sync offline forms when back online
  async syncOfflineForms() {
    if (!FormService.isOnline) {
      console.log("Cannot sync: Currently offline");
      return;
    }

    try {
      const completedForms = await IndexDBService.getCompletedForms();
      let syncedCount = 0;

      for (const form of completedForms) {
        try {
          await FormService.submitToServer(form.formData);
          await IndexDBService.deleteForm(form.id);
          syncedCount++;
          console.log(`Synced form ${form.id}`);
        } catch (error) {
          console.error(`Failed to sync form ${form.id}:`, error);
        }
      }

      if (syncedCount > 0) {
        alert(`Successfully synced ${syncedCount} offline form(s)!`);

        // Update the saved forms count display
        const onlineToggleContainer = document.querySelector(
          ".online-toggle-container"
        );
        if (onlineToggleContainer && typeof OnlineToggle !== "undefined") {
          OnlineToggle.updateSavedFormsCount(onlineToggleContainer);
        }
      }
    } catch (error) {
      console.error("Failed to sync offline forms:", error);
    }
  },
};
