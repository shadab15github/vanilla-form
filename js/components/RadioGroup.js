const RadioGroup = {
  create(props) {
    const wrapper = DomUtils.createElement("div", "input-wrapper");
    wrapper.style.width = props.width || "100%";

    if (props.label) {
      const label = DomUtils.createElement("label", "input-label");
      label.textContent = props.label;
      wrapper.appendChild(label);
    }

    const radioContainer = DomUtils.createElement(
      "div",
      props.orientation === "vertical" ? "radio-group vertical" : "radio-group"
    );

    if (props.options && props.options.length > 0) {
      props.options.forEach((option) => {
        const label = DomUtils.createElement("label", "radio-label");

        const input = DomUtils.createElement("input", "radio-input", {
          type: "radio",
          name: props.name,
          value: option.value,
        });

        if (props.value === option.value) {
          input.checked = true;
        }

        if (props.onChange) {
          DomUtils.addEvent(input, "change", props.onChange);
        }

        const text = DomUtils.createElement("span", "radio-text", {
          textContent: option.label,
        });

        label.appendChild(input);
        label.appendChild(text);
        radioContainer.appendChild(label);
      });
    }

    wrapper.appendChild(radioContainer);
    return wrapper;
  },
};
