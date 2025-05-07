document.addEventListener("DOMContentLoaded", () => {
  const tempoSlider = document.getElementById("tempo");
  const tempoValue = document.getElementById("tempoValue");
  const measureSlider = document.getElementById("measures");
  const measureValue = document.getElementById("measureValue");
  const generateBtn = document.getElementById("generateBtn");
  const notationDiv = document.getElementById("notation");

  const keySelection = document.getElementById("keySelection");
  const allKeys = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F", "Chromatic"];

  // Create checkboxes for keys
  allKeys.forEach(key => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = key;
    checkbox.name = "key";
    if (key === "C") label.style.fontWeight = "bold"; // Bold label for C
    label.appendChild(checkbox);
    label.append(" " + key);
    keySelection.appendChild(label);
    keySelection.appendChild(document.createElement("br"));
  });

  // Display tempo value live
  tempoSlider.addEventListener("input", () => {
    tempoValue.textContent = tempoSlider.value;
  });

  measureSlider.addEventListener("input", () => {
    measureValue.textContent = measureSlider.value;
  });

  // Handle "Generate Etude" button click
  generateBtn.addEventListener("click", async () => {
    const selectedKeys = [...document.querySelectorAll('input[name="key"]:checked')].map(cb => cb.value);
    const useRhythms = document.getElementById("useRhythms").checked;
    const useIntervals = document.getElementById("useIntervals").checked;
    const tempo = parseInt(tempoSlider.value);
    const numMeasures = parseInt(measureSlider.value);

    const postData = {
      selected_keys: selectedKeys,
      selected_rhythms: useRhythms,
      use_intervals: useIntervals,
      num_measures: numMeasures
    };

    try {
      const response = await fetch("https://<your-backend-url>/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) throw new Error("Server error");

      const etude = await response.json();
      console.log("Etude:", etude);

      // For now, just show it as raw note list
      notationDiv.innerHTML = `<pre>${JSON.stringify(etude, null, 2)}</pre>`;

      // TODO: Render with VexFlow here

    } catch (err) {
      console.error("Error generating etude:", err);
      notationDiv.textContent = "Error generating etude. Please try again.";
    }
  });
});
