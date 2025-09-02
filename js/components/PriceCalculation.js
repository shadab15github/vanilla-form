const PriceCalculation = {
  create(props) {
    const wrapper = DomUtils.createElement("div", "input-wrapper");
    wrapper.style.width = props.width || "100%";

    if (props.label) {
      const label = DomUtils.createElement("label", "input-label", {
        textContent: props.label,
      });
      wrapper.appendChild(label);
    }

    const formData = props.formData || {};
    const showAnnexe = formData.separateAnnexe === "yes";

    if (showAnnexe) {
      const hint = DomUtils.createElement("p", "price-hint", {
        textContent: "Enter a number between $1 and $2,000,000",
      });
      wrapper.appendChild(hint);

      const row = DomUtils.createElement("div", "price-calculation-row");

      // Caravan input
      const caravanGroup = DomUtils.createElement("div", "price-input-group");
      const caravanContainer = DomUtils.createElement(
        "div",
        "price-input-highlighted"
      );

      const caravanLabel = DomUtils.createElement("span", "price-input-label", {
        textContent: "Solid Wall Caravan",
      });

      const caravanInput = DomUtils.createElement(
        "input",
        "price-input-inline",
        {
          type: "text",
          name: "caravanPrice",
          value: formData.caravanPrice || "10000",
        }
      );

      caravanContainer.appendChild(caravanLabel);
      caravanContainer.appendChild(caravanInput);
      caravanGroup.appendChild(caravanContainer);

      // Plus sign
      const plus = DomUtils.createElement("span", "price-operator", {
        textContent: "+",
      });

      // Annexe input
      const annexeGroup = DomUtils.createElement("div", "price-input-group");
      const annexeInput = DomUtils.createElement("input", "input-field", {
        type: "text",
        name: "annexePrice",
        placeholder: "Annexe",
        value: formData.annexePrice || "",
      });

      annexeGroup.appendChild(annexeInput);

      // Equals sign
      const equals = DomUtils.createElement("span", "price-operator", {
        textContent: "=",
      });

      // Total display
      const totalDiv = DomUtils.createElement("div", "price-total");

      // Function to update total
      const updateTotal = () => {
        const caravanPrice = parseInt(caravanInput.value || 0);
        const annexePrice = parseInt(annexeInput.value || 0);
        const total = caravanPrice + annexePrice;
        totalDiv.textContent = `$${total.toLocaleString()}`;
      };

      // Initial total calculation
      updateTotal();

      // Add event listeners for both inputs
      if (props.onChange) {
        DomUtils.addEvent(caravanInput, "input", (e) => {
          props.onChange(e);
          updateTotal();
        });

        DomUtils.addEvent(annexeInput, "input", (e) => {
          props.onChange(e);
          updateTotal();
        });
      } else {
        // If no onChange provided, still update the total
        DomUtils.addEvent(caravanInput, "input", updateTotal);
        DomUtils.addEvent(annexeInput, "input", updateTotal);
      }

      DomUtils.appendChildren(row, [
        caravanGroup,
        plus,
        annexeGroup,
        equals,
        totalDiv,
      ]);

      wrapper.appendChild(row);
    } else {
      const input = DomUtils.createElement("input", "input-field", {
        type: "text",
        name: "purchasePrice",
        placeholder: "Enter purchase price",
        value: formData.purchasePrice || "",
      });

      if (props.onChange) {
        DomUtils.addEvent(input, "input", props.onChange);
      }

      wrapper.appendChild(input);
    }

    return wrapper;
  },
};
