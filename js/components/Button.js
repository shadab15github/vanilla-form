const Button = {
  create(props) {
    const classes = ["btn"];

    if (props.variant === "secondary") {
      classes.push("btn-secondary");
    } else {
      classes.push("btn-primary");
    }

    if (props.fullWidth) {
      classes.push("btn-full");
    }

    const button = DomUtils.createElement("button", classes.join(" "), {
      type: props.type || "button",
    });

    button.textContent = props.children || props.text || "Button";

    if (props.disabled) {
      button.disabled = true;
    }

    if (props.onClick) {
      DomUtils.addEvent(button, "click", props.onClick);
    }

    return button;
  },
};
