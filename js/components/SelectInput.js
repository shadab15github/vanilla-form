const SelectInput = {
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

    const select = DomUtils.createElement("select", "input-field", {
      id: props.name,
      name: props.name,
    });

    if (props.placeholder) {
      const placeholderOption = DomUtils.createElement("option", "", {
        value: "",
        textContent: props.placeholder,
      });
      select.appendChild(placeholderOption);
    }

    if (props.options && props.options.length > 0) {
      props.options.forEach((option) => {
        const optionElement = DomUtils.createElement("option", "", {
          value: option.value,
          textContent: option.label,
        });
        select.appendChild(optionElement);
      });
    }

    select.value = props.value || "";

    if (props.required) {
      select.required = true;
    }

    if (props.onChange) {
      DomUtils.addEvent(select, "change", props.onChange);
    }

    wrapper.appendChild(select);
    return wrapper;
  },
};
