const NumberInput = {
  create(props) {
    const wrapper = DomUtils.createElement("div", "input-wrapper");
    wrapper.style.width = props.width || "100%";

    if (props.label) {
      const label = DomUtils.createElement("label", "input-label", {
        for: props.name,
      });
      label.textContent = props.label;

      if (props.required) {
        const asterisk = DomUtils.createElement("span", "required-asterisk", {
          textContent: "*",
        });
        label.appendChild(asterisk);
      }

      wrapper.appendChild(label);
    }

    const input = DomUtils.createElement("input", "input-field", {
      type: "number",
      id: props.name,
      name: props.name,
      placeholder: props.placeholder || "",
      value: props.value || "",
    });

    if (props.min !== undefined) {
      input.min = props.min;
    }

    if (props.max !== undefined) {
      input.max = props.max;
    }

    if (props.step !== undefined) {
      input.step = props.step;
    }

    if (props.required) {
      input.required = true;
    }

    if (props.disabled) {
      input.disabled = true;
    }

    if (props.onChange) {
      DomUtils.addEvent(input, "input", props.onChange);
    }

    wrapper.appendChild(input);
    return wrapper;
  },
};
