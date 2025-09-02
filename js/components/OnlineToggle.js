// js/components/OnlineToggle.js
const OnlineToggle = {
  create() {
    const container = DomUtils.createElement("div", "online-toggle-container");

    // Toggle switch wrapper
    const toggleWrapper = DomUtils.createElement("div", "toggle-wrapper");

    // Label
    const label = DomUtils.createElement("label", "toggle-label");
    label.textContent = "Network Status: ";

    // Status text
    const statusText = DomUtils.createElement("span", "status-text");
    statusText.textContent = FormService.getIsOnline() ? "Online" : "Offline";
    statusText.style.color = FormService.getIsOnline() ? "#10b981" : "#ef4444";
    statusText.style.fontWeight = "bold";

    // Toggle switch
    const toggleSwitch = DomUtils.createElement("label", "switch");

    const input = DomUtils.createElement("input");
    input.type = "checkbox";
    input.checked = FormService.getIsOnline();
    input.addEventListener("change", (e) => {
      FormService.setIsOnline(e.target.checked);
      statusText.textContent = e.target.checked ? "Online" : "Offline";
      statusText.style.color = e.target.checked ? "#10b981" : "#ef4444";

      // Show notification
      OnlineToggle.showNotification(
        e.target.checked
          ? "Switched to Online Mode"
          : "Switched to Offline Mode"
      );
    });

    const slider = DomUtils.createElement("span", "slider");

    toggleSwitch.appendChild(input);
    toggleSwitch.appendChild(slider);

    toggleWrapper.appendChild(label);
    toggleWrapper.appendChild(statusText);
    toggleWrapper.appendChild(toggleSwitch);

    container.appendChild(toggleWrapper);

    // Add saved forms count for offline mode
    if (!FormService.getIsOnline()) {
      OnlineToggle.updateSavedFormsCount(container);
    }

    return container;
  },

  async updateSavedFormsCount(container) {
    try {
      const completedForms = await IndexDBService.getCompletedForms();
      const countDiv = container.querySelector(".saved-forms-count");

      if (completedForms.length > 0) {
        if (countDiv) {
          countDiv.textContent = `Offline forms ready to sync: ${completedForms.length}`;
        } else {
          const newCountDiv = DomUtils.createElement(
            "div",
            "saved-forms-count"
          );
          newCountDiv.textContent = `Offline forms ready to sync: ${completedForms.length}`;
          newCountDiv.style.fontSize = "12px";
          newCountDiv.style.color = "#f59e0b";
          newCountDiv.style.marginTop = "5px";
          newCountDiv.style.fontWeight = "500";
          container.appendChild(newCountDiv);
        }
      } else if (countDiv) {
        countDiv.remove();
      }
    } catch (error) {
      console.error("Failed to update saved forms count:", error);
    }
  },

  showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = DomUtils.createElement("div", "notification");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
};
