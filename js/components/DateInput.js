const DateInput = {
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
      type: "text",
      id: props.name,
      name: props.name,
      placeholder: props.placeholder || "",
      value: props.value || "",
    });

    if (props.required) {
      input.required = true;
    }

    if (props.onChange) {
      DomUtils.addEvent(input, "input", props.onChange);
    }

    wrapper.appendChild(input);
    return wrapper;
  },
};
