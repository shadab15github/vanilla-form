// js/components/VanillaForm.js
const VanillaForm = {
  async init() {
    // Initialize IndexedDB first
    try {
      await IndexDBService.init();
      console.log("IndexedDB ready");
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
    }

    // Initialize form data - this will either resume an existing incomplete session
    // or create a new form entry
    await FormService.initializeForm();

    const app = document.getElementById("app");
    VanillaForm.render(app);
  },

  render(container) {
    DomUtils.clearElement(container);

    const mainContainer = DomUtils.createElement("div", "container");

    // Add session info display for debugging (optional - remove in production)
    if (FormService.sessionId) {
      const sessionInfo = DomUtils.createElement("div", "session-info", {
        innerHTML: `<small>Session: ${FormService.sessionId} | Form ID: ${
          FormService.currentFormId
        } | Step: ${FormService.getCurrentStep()}</small>`,
      });
      sessionInfo.style.padding = "10px";
      sessionInfo.style.backgroundColor = "#f0f0f0";
      sessionInfo.style.marginBottom = "20px";
      sessionInfo.style.fontSize = "12px";
      sessionInfo.style.color = "#666";
      mainContainer.appendChild(sessionInfo);
    }

    // Online/Offline Toggle
    const onlineToggle = OnlineToggle.create();
    mainContainer.appendChild(onlineToggle);

    // Progress Indicator
    const progressIndicator = VanillaForm.createProgressIndicator();
    mainContainer.appendChild(progressIndicator);

    // Step Labels
    const stepLabels = VanillaForm.createStepLabels();
    mainContainer.appendChild(stepLabels);

    // Form Container
    const formContainer = VanillaForm.createFormContainer();
    mainContainer.appendChild(formContainer);

    container.appendChild(mainContainer);
  },

  createProgressIndicator() {
    const progressContainer = DomUtils.createElement(
      "div",
      "progress-container"
    );
    const totalSteps = FormService.getTotalSteps();
    const currentStep = FormService.getCurrentStep();

    for (let i = 1; i <= totalSteps; i++) {
      const stepDiv = DomUtils.createElement("div", "");

      if (i === currentStep) {
        stepDiv.className = "progress-step active";
        stepDiv.textContent = i;
      } else if (i < currentStep) {
        stepDiv.className = "progress-step completed";
        stepDiv.innerHTML =
          '<svg class="checkmark" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
      } else {
        stepDiv.className = "progress-step";
        stepDiv.textContent = i;
      }

      if (i !== currentStep && i >= currentStep) {
        stepDiv.textContent = i;
      }

      progressContainer.appendChild(stepDiv);

      if (i < totalSteps) {
        const line = DomUtils.createElement("div", "progress-line");
        progressContainer.appendChild(line);
      }
    }

    return progressContainer;
  },

  createStepLabels() {
    const labelsContainer = DomUtils.createElement("div", "step-labels");
    const currentStep = FormService.getCurrentStep();

    const label1 = DomUtils.createElement(
      "div",
      currentStep === 1 ? "step-label active" : "step-label",
      {
        textContent: "Customer details",
      }
    );

    const label2 = DomUtils.createElement(
      "div",
      currentStep === 2 ? "step-label active" : "step-label",
      {
        textContent: "Solid Wall Caravan Details",
      }
    );

    labelsContainer.appendChild(label1);
    labelsContainer.appendChild(label2);

    return labelsContainer;
  },

  createFormContainer() {
    const formContainer = DomUtils.createElement("div", "form-container");

    // Form Content
    const formContent = DomUtils.createElement("div", "form-content");
    const currentStepConfig = FormService.getCurrentStepConfig();

    if (currentStepConfig) {
      currentStepConfig.sections.forEach((section) => {
        const sectionDiv = DomUtils.createElement("div", "form-section");

        if (section.sectionLabel) {
          const label = DomUtils.createElement("label", "section-label");
          label.textContent = section.sectionLabel;

          if (section.sectionLabel === "Customer") {
            const asterisk = DomUtils.createElement(
              "span",
              "required-asterisk",
              {
                textContent: "*",
              }
            );
            label.appendChild(asterisk);
          }

          sectionDiv.appendChild(label);
        }

        section.rows.forEach((row) => {
          const rowDiv = DomUtils.createElement("div", "form-row");

          row.fields.forEach((field) => {
            const fieldElement = VanillaForm.renderField(field);
            if (fieldElement) {
              rowDiv.appendChild(fieldElement);
            }
          });

          sectionDiv.appendChild(rowDiv);
        });

        formContent.appendChild(sectionDiv);
      });
    }

    formContainer.appendChild(formContent);

    // Action Buttons
    const actions = VanillaForm.createActionButtons();
    formContainer.appendChild(actions);

    return formContainer;
  },

  renderField(field) {
    const commonProps = {
      name: field.name,
      value: FormService.getFormData()[field.name] || field.value || "",
      onChange: VanillaForm.handleInputChange,
      placeholder: field.placeholder,
      label: field.label,
      required: field.required,
      disabled: field.disabled,
      width: field.width,
    };

    switch (field.type) {
      case "text":
        return TextInput.create(commonProps);
      case "number":
        return NumberInput.create({
          ...commonProps,
          min: field.min,
          max: field.max,
          step: field.step,
        });
      case "select":
        return SelectInput.create({
          ...commonProps,
          options: field.options || [],
        });
      case "date":
        return DateInput.create(commonProps);
      case "radio":
        return RadioGroup.create({
          name: field.name,
          label: field.label,
          value: FormService.getFormData()[field.name] || field.value,
          options: field.options,
          onChange: VanillaForm.handleInputChange,
          width: field.width,
        });
      case "priceCalculation":
        return PriceCalculation.create({
          label: field.label,
          formData: FormService.getFormData(),
          onChange: VanillaForm.handleInputChange,
          width: field.width,
        });
      default:
        return null;
    }
  },

  createActionButtons() {
    const actions = DomUtils.createElement("div", "form-actions");
    const currentStep = FormService.getCurrentStep();
    const totalSteps = FormService.getTotalSteps();

    if (currentStep === 1) {
      actions.className = "form-actions single";
    }

    if (currentStep > 1) {
      const backButton = Button.create({
        text: "Back",
        variant: "secondary",
        onClick: VanillaForm.handleBack,
      });
      actions.appendChild(backButton);
    }

    const continueButton = Button.create({
      text: currentStep === totalSteps ? "Submit" : "Continue",
      variant: "primary",
      onClick: VanillaForm.handleContinue,
    });
    actions.appendChild(continueButton);

    // Add sync button if offline forms exist and we're online
    if (FormService.getIsOnline()) {
      VanillaForm.addSyncButtonIfNeeded(actions);
    }

    return actions;
  },

  async addSyncButtonIfNeeded(container) {
    try {
      const completedForms = await IndexDBService.getCompletedForms();
      if (completedForms.length > 0) {
        const syncButton = Button.create({
          text: `Sync ${completedForms.length} Offline Form(s)`,
          variant: "success",
          onClick: async () => {
            await FormService.syncOfflineForms();
            // Re-render to update UI
            const app = document.getElementById("app");
            VanillaForm.render(app);
          },
        });
        syncButton.style.marginLeft = "auto";
        container.appendChild(syncButton);
      }
    } catch (error) {
      console.error("Failed to check for offline forms:", error);
    }
  },

  async handleInputChange(e) {
    const { name, value } = e.target;

    // Update form data in FormService (this will also update IndexedDB)
    await FormService.updateFormData(name, value);

    // Re-render if it affects conditional fields
    if (name === "separateAnnexe") {
      const app = document.getElementById("app");
      VanillaForm.render(app);
    }
  },

  async handleContinue() {
    const currentStep = FormService.getCurrentStep();
    const totalSteps = FormService.getTotalSteps();

    if (currentStep < totalSteps) {
      await FormService.setCurrentStep(currentStep + 1);
      const app = document.getElementById("app");
      VanillaForm.render(app);
    } else {
      await FormService.submitForm();
    }
  },

  async handleBack() {
    const currentStep = FormService.getCurrentStep();

    if (currentStep > 1) {
      await FormService.setCurrentStep(currentStep - 1);
      const app = document.getElementById("app");
      VanillaForm.render(app);
    }
  },
};

// Initialize the app when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  VanillaForm.init();
});
