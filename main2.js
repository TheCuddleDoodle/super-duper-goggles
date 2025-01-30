(function () {
  // 1. Inject CSS Styles
  const styles = `
      .widget-container {
        position: fixed;
        top: 20px;
        left: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 500px;
        user-select: none;
        font-family: Arial, sans-serif;
        z-index: 1000;
      }

      .widget-header {
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
        cursor: move;
        display: flex;
        align-items: center;
        font-weight: bold;
      }

      .controls {
        padding: 16px;
        display: grid;
        gap: 12px;
      }

      .control-group {
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
      }

      .control-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      button {
        padding: 6px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s, color 0.3s;
      }

      button.active {
        background: #007bff;
        color: white;
        border-color: #0056b3;
      }

      button:hover {
        background: #f0f0f0;
      }

      button.active:hover {
        background: #0056b3;
      }

      #generate-button {
        width: 100%;
        padding: 10px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.3s;
      }

      #generate-button:hover {
        background: #218838;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
      }

      th {
        background: #f8f9fa;
        font-size: 12px;
        color: #666;
      }
    `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // 2. Create HTML Structure
  const widget = document.createElement("div");
  widget.className = "widget-container";
  widget.id = "widget";

  const header = document.createElement("div");
  header.className = "widget-header";
  header.id = "widget-header";
  header.textContent = "Batch SS Tool";

  const controls = document.createElement("div");
  controls.className = "controls";

  backgroundState = false;

  function createControlGroup(id, headerText, buttonGroupId, hasTable = false) {
    const controlGroup = document.createElement("div");
    controlGroup.className = "control-group";
    controlGroup.id = id;

    if (hasTable) {
      const table = document.createElement("table");

      const headerRow = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);

      const buttonRow = document.createElement("tr");
      const td = document.createElement("td");
      const buttonGroup = document.createElement("div");
      buttonGroup.className = "button-group";
      buttonGroup.id = buttonGroupId;
      td.appendChild(buttonGroup);
      buttonRow.appendChild(td);

      table.appendChild(headerRow);
      table.appendChild(buttonRow);
      controlGroup.appendChild(table);
    } else {
      const label = document.createElement("div");
      label.className = "control-label";
      label.textContent = headerText;
      const buttonGroup = document.createElement("div");
      buttonGroup.className = "button-group";
      buttonGroup.id = buttonGroupId;

      // Add resolution input for resolution control group
      if (id === "resolution-control") {
        const inputContainer = document.createElement("div");
        inputContainer.className = "resolution-input-container";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "resolution-input";
        input.placeholder = "e.g., 1920x1080";
        input.id = "custom-resolution";

        const addButton = document.createElement("button");
        addButton.className = "add-resolution-button";
        addButton.textContent = "Add";
        addButton.onclick = addCustomResolution;

        inputContainer.appendChild(input);
        inputContainer.appendChild(addButton);

        controlGroup.appendChild(label);
        controlGroup.appendChild(buttonGroup);
        controlGroup.appendChild(inputContainer);
      } else {
        controlGroup.appendChild(label);
        controlGroup.appendChild(buttonGroup);
      }
    }

    return controlGroup;
  }

  // Add the custom resolution function
  function addCustomResolution() {
    const input = document.getElementById("custom-resolution");
    const resolution = input.value.trim();

    // Validate resolution format (e.g., 1920x1080)
    if (!/^\d+x\d+$/.test(resolution)) {
      alert("Please enter a valid resolution format (e.g., 1920x1080)");
      return;
    }

    // Add to resolutions array if it doesn't exist
    if (!resolutions.includes(resolution)) {
      resolutions.push(resolution);

      // Add new button
      const container = document.getElementById("resolution-buttons");
      const button = document.createElement("button");
      button.textContent = resolution;
      button.dataset.value = resolution;
      button.onclick = () => toggleSelection("resolution", resolution);
      container.appendChild(button);

      // Clear input
      input.value = "";
    } else {
      alert("This resolution already exists!");
    }
  }
  const variantControl = createControlGroup(
    "variant-control",
    "Variant",
    "variant-buttons",
    true
  );
  const colorControl = createControlGroup(
    "color-control",
    "Color",
    "color-buttons",
    true
  );
  const resolutionControl = createControlGroup(
    "resolution-control",
    "Resolution",
    "resolution-buttons"
  );
  const imageTypeControl = createControlGroup(
    "imageType-control",
    "Image Type",
    "imageType-buttons"
  );

  const generateControlGroup = document.createElement("div");
  generateControlGroup.className = "control-group";
  const generateButton = document.createElement("button");
  generateButton.id = "generate-button";
  generateButton.textContent = "Generate Image";
  generateButton.onclick = generateImage;
  generateControlGroup.appendChild(generateButton);

  // Background Toggle Button
  const backgroundToggle = document.createElement("button");
  backgroundToggle.id = "background-toggle";
  backgroundToggle.textContent = "Toggle Background";
  backgroundToggle.onclick = toggleBackground;

  generateControlGroup.appendChild(generateButton);
  generateControlGroup.appendChild(backgroundToggle);

  // Add the function to toggle background
  function toggleBackground() {
    const button = document.getElementById("background-toggle");
    button.classList.toggle("active");

    backgroundState = !backgroundState;
  }

  controls.appendChild(variantControl);
  controls.appendChild(colorControl);
  controls.appendChild(resolutionControl);
  controls.appendChild(imageTypeControl);
  controls.appendChild(generateControlGroup);

  widget.appendChild(header);
  widget.appendChild(controls);

  document.body.appendChild(widget);

  // 3. Implement Functionality
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e) {
    initialX = e.clientX - widget.offsetLeft;
    initialY = e.clientY - widget.offsetTop;
    isDragging = true;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      widget.style.left = currentX + "px";
      widget.style.top = currentY + "px";
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  const state = {
    variant: [],
    color: [],
    resolution: [],
    imageType: [],
  };

  const variants = ONE3D.webglRoot.data.settings.accessories_group_calls
    .filter(ele => ele.type.includes("variant"))
    .map(ele => {
        // Perform necessary transformations if needed
        return ele.name; 
    });

  const colors =  ONE3D.webglRoot.data.settings.paint.CARPAINT.options
    .map(ele => {
        // Perform necessary transformations if needed
        return ele.name; 
    });;
  const resolutions = ["1920x1080", "1280x720", "800x600"];
  const imageTypes = ["PNG", "JPG"];

  function initializeControls() {
    initializeButtons("variant", variants, "variant-buttons", "variant");
    initializeButtons(
      "color",
      colors.map((color) => ({ name: color, value: color })),
      "color-buttons",
      "color",
      true
    );
    initializeButtons(
      "resolution",
      resolutions,
      "resolution-buttons",
      "resolution"
    );
    initializeButtons(
      "imageType",
      imageTypes,
      "imageType-buttons",
      "imageType"
    );
  }

  function initializeButtons(
    groupName,
    options,
    containerId,
    stateKey,
    hasValue = false
  ) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    options.forEach((option) => {
      const button = document.createElement("button");
      if (hasValue && groupName === "color") {
        button.textContent = option.name;
        button.dataset.value = option.value;
        button.onclick = () => toggleSelection(groupName, option.value);
      } else {
        button.textContent = typeof option === "string" ? option : option.value;
        button.dataset.value =
          typeof option === "string" ? option : option.value;
        button.onclick = () => toggleSelection(groupName, button.dataset.value);
      }
      container.appendChild(button);
    });
  }

  function toggleSelection(groupName, value) {
    if (!state[groupName].includes(value)) {
      state[groupName].push(value);
      setActiveState(groupName, value, true);
    } else {
      state[groupName].splice(state[groupName].indexOf(value), 1);
      setActiveState(groupName, value, false);
    }
  }

  function setActiveState(groupName, value, isActive) {
    let buttons;
    switch (groupName) {
      case "variant":
        buttons = document.querySelectorAll("#variant-buttons button");
        buttons.forEach((btn) => {
          if (btn.textContent === value) {
            if (isActive) btn.classList.add("active");
            else btn.classList.remove("active");
          }
        });
        break;
      case "color":
        buttons = document.querySelectorAll("#color-buttons button");
        buttons.forEach((btn) => {
          const colorValue = btn.dataset.value;
          if (colorValue === value) {
            if (isActive) btn.classList.add("active");
            else btn.classList.remove("active");
          }
        });
        break;
      case "resolution":
        buttons = document.querySelectorAll("#resolution-buttons button");
        buttons.forEach((btn) => {
          if (btn.textContent === value) {
            if (isActive) btn.classList.add("active");
            else btn.classList.remove("active");
          }
        });
        break;
      case "imageType":
        buttons = document.querySelectorAll("#imageType-buttons button");
        buttons.forEach((btn) => {
          if (btn.textContent === value) {
            if (isActive) btn.classList.add("active");
            else btn.classList.remove("active");
          }
        });
        break;
    }
  }

  function backgroundToggler() {
    ONE3D.getAllActiveAccessories().forEach((ele) => {
      if (
        ele.includes("BACKGROUND") ||
        ele.includes("BG") ||
        ele.includes("bg") ||
        ele.includes("background") ||
        ele.includes("BackGround")
      ) {
        ONE3D.hideAccessory(ele);
      }
    });
  }

  async function generateImage() {
    const { variant, color, resolution, imageType } = state;

    if (
      variant.length === 0 ||
      color.length === 0 ||
      resolution.length === 0 ||
      imageType.length === 0
    ) {
      alert("Please select at least one option from each category.");
      return;
    }

    const combinations = [];
    variant.forEach((v) => {
      color.forEach((c) => {
        resolution.forEach((r) => {
          imageType.forEach((i) => {
            combinations.push({ v, c, r, i });
          });
        });
      });
    });

    const totalImages = combinations.length;
    let currentImage = 0;
    const progressDiv = document.createElement("div");
    progressDiv.style.position = "fixed";
    progressDiv.style.top = "20px";
    progressDiv.style.right = "20px";
    progressDiv.style.padding = "10px";
    progressDiv.style.background = "#fff";
    progressDiv.style.border = "1px solid #ccc";
    document.body.appendChild(progressDiv);
    let standAloneCam = ONE3D.getCameraSphericalRotation();
    for (const combo of combinations) {
      currentImage++;
      progressDiv.textContent = `Generating image ${currentImage} of ${totalImages}`;

      const fileName = `${combo.v}_${combo.r}_${combo.c}.${combo.i}`;

      await ONE3D.changeVariant(combo.v);
      if (backgroundState) {
        backgroundToggler();
      }
      ONE3D.setCameraSphericalRotation(standAloneCam);
      await ONE3D.setPaint("CARPAINT", combo.c);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await new Promise((resolve) => {
        ONE3D.webglRoot.screenshotToBlob(
          (blobDat) => {
            const byteString = atob(blobDat.exterior1.split(",")[1]);
            const mimeString = blobDat.exterior1
              .split(",")[0]
              .split(":")[1]
              .split(";")[0];

            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeString });

            const downloadLink = document.createElement("a");
            const url = URL.createObjectURL(blob);

            downloadLink.href = url;
            downloadLink.download = fileName;

            document.body.appendChild(downloadLink);
            downloadLink.click();

            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);

            resolve();
          },
          ["exterior1"],
          {
            width: parseInt(combo.r.split("x")[0]),
            height: parseInt(combo.r.split("x")[1]),
            scale: 1,
          },
          true
        );
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    document.body.removeChild(progressDiv);
    alert("All images have been generated successfully!");
  }

  initializeControls();
})();
