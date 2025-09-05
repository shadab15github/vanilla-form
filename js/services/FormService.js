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

  // Initialize form - either resume existing incomplete session or create new one
  async initializeForm() {
    try {
      // Check for existing incomplete form session
      const incompleteForms = await IndexDBService.getIncompleteForms();

      if (incompleteForms && incompleteForms.length > 0) {
        // Sort by timestamp to get the most recent incomplete form
        const sortedForms = incompleteForms.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        const latestIncompleteForm = sortedForms[0];

        // Resume the existing session
        console.log(
          "Resuming existing session:",
          latestIncompleteForm.sessionId
        );

        FormService.currentFormId = latestIncompleteForm.id;
        FormService.sessionId = latestIncompleteForm.sessionId;
        FormService.formData = latestIncompleteForm.formData || {
          separateAnnexe: "no",
          caravanPrice: "",
          annexePrice: "",
          purchasePrice: "",
        };
        FormService.currentStep = latestIncompleteForm.step || 1;

        console.log("Resumed form with ID:", FormService.currentFormId);
        console.log("Resumed at step:", FormService.currentStep);
        console.log("Resumed form data:", FormService.formData);
      } else {
        // No incomplete forms found, create a new session
        console.log("No incomplete forms found, creating new session");

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
        const formId = await IndexDBService.createForm(FormService.sessionId);
        FormService.currentFormId = formId;
        console.log("New form initialized with ID:", formId);
      }
    } catch (error) {
      console.error("Failed to initialize form:", error);

      // Fallback: create a new form if there's an error
      FormService.formData = {
        separateAnnexe: "no",
        caravanPrice: "",
        annexePrice: "",
        purchasePrice: "",
      };
      FormService.currentStep = 1;
      FormService.currentFormId = null;
      FormService.sessionId = FormService.generateSessionId();

      try {
        const formId = await IndexDBService.createForm(FormService.sessionId);
        FormService.currentFormId = formId;
        console.log("New form initialized (fallback) with ID:", formId);
      } catch (fallbackError) {
        console.error(
          "Failed to create form in IndexedDB (fallback):",
          fallbackError
        );
      }
    }
  },

  // Reset form and create new session (only called after successful submission)
  async resetAndCreateNewSession() {
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
      console.log("New form session created with ID:", formId);
    } catch (error) {
      console.error("Failed to create new form session in IndexedDB:", error);
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
          false // not complete yet
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
      // Online mode: Submit to server and mark as complete
      try {
        // Mark as complete before submission
        if (FormService.currentFormId) {
          await IndexDBService.updateForm(
            FormService.currentFormId,
            FormService.formData,
            FormService.currentStep,
            true // mark as complete
          );
        }

        // Simulate API call
        await FormService.submitToServer(FormService.formData);

        // Delete from IndexedDB after successful submission
        if (FormService.currentFormId) {
          await IndexDBService.deleteForm(FormService.currentFormId);
        }

        alert("Form submitted successfully (Online)!");

        // Create a new session for the next form
        await FormService.clearAndResetForm();
      } catch (error) {
        console.error("Failed to submit form online:", error);

        // Revert completion status if submission failed
        if (FormService.currentFormId) {
          await IndexDBService.updateForm(
            FormService.currentFormId,
            FormService.formData,
            FormService.currentStep,
            false // revert to incomplete
          );
        }

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

        // Create a new session for the next form
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
    // Reset and create a new session
    await FormService.resetAndCreateNewSession();

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
