document.getElementById("tempo").addEventListener("input", function () {
  document.getElementById("tempoValue").textContent = this.value;
});

document.getElementById("numMeasures").addEventListener("input", function () {
  document.getElementById("measureValue").textContent = this.value;
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const selectedKeys = Array.from(document.querySelectorAll("input[name='keys']:checked"))
    .map(el => el.value);
  const useRhythms = document.getElementById("useRhythms").checked;
  const useIntervals = document.getElementById("useIntervals").checked;
  const numMeasures = parseInt(document.getElementById("numMeasures").value);

  try {
    const res = await fetch("https://tinquilts-backend.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selected_keys: selectedKeys,
        selected_rhythms: useRhythms,
        use_intervals: useIntervals,
        num_measures: numMeasures
      })
    });

    if (!res.ok) throw new Error("Failed to generate etude.");

    const data = await res.json();
    const etude = data.etude;

    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear old content

    const VF = Vex.Flow;
    const renderer = new VF.Renderer(output, VF.Renderer.Backends.SVG);
    renderer.resize(700, 200);
    const context = renderer.getContext();

    const stave = new VF.Stave(10, 40, 680);
    stave.addClef("treble");

    // Add key signature if available
    if (selectedKeys.length > 0) {
      if (!["Chromatic"].includes(selectedKeys[0])) {
        stave.addKeySignature(selectedKeys[0]);
      }
    }

    stave.setContext(context).draw();

    const vexNotes = etude.map(({ note, duration }) => {
      const key = note.replace(/(\d)/, "/$1"); // e.g., "C4" → "c/4"
      return new VF.StaveNote({
        clef: "treble",
        keys: [key],
        duration: duration
      });
    });

    const voice = new VF.Voice({
      num_beats: etude.length,
      beat_value: 4
    });

    voice.addTickables(vexNotes);
    new VF.Formatter().joinVoices([voice]).format([voice], 600);
    voice.draw(context, stave);

  } catch (err) {
    document.getElementById("output").textContent = `Error: ${err.message}`;
  }
});
