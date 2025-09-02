const DomUtils = {
  createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    Object.keys(attributes).forEach((key) => {
      if (key === "textContent") {
        element.textContent = attributes[key];
      } else if (key === "innerHTML") {
        element.innerHTML = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    return element;
  },

  appendChildren(parent, children) {
    children.forEach((child) => {
      if (child) {
        parent.appendChild(child);
      }
    });
  },

  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  addEvent(element, event, handler) {
    element.addEventListener(event, handler);
  },

  removeEvent(element, event, handler) {
    element.removeEventListener(event, handler);
  },
};
