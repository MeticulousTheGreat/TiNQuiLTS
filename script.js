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

    const notationDiv = document.getElementById("output");
    notationDiv.innerHTML = ""; // Clear previous notation

    const VF = Vex.Flow;
    const renderer = new VF.Renderer(notationDiv, VF.Renderer.Backends.SVG);
    renderer.resize(700, 200);
    const context = renderer.getContext();

// Use percussion clef if no key selected
    const usePercussion = selectedKeys.length === 0;

    const stave = new VF.Stave(10, 40, 680);
    stave.addClef(usePercussion ? "percussion" : "treble");
    stave.setContext(context).draw();

    const vexNotes = etude.map(({ note, duration }) => {
      const vfNote = usePercussion ? "c/5" : note.replace(/(\d)/, "/$1");
      return new VF.StaveNote({
        clef: usePercussion ? "percussion" : "treble",
        keys: [vfNote],
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

// OLD:
// document.getElementById("output").textContent = data.etude.join(" ");

  } catch (err) {
    document.getElementById("output").textContent = `Error: ${err.message}`;
  }
});
