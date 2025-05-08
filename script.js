document.getElementById("tempo").addEventListener("input", function () {
  document.getElementById("tempoValue").textContent = this.value;
});

document.getElementById("numMeasures").addEventListener("input", function () {
  document.getElementById("measureValue").textContent = this.value;
});

// NEW: Octave range display
document.getElementById("octaveRange").addEventListener("input", function () {
  document.getElementById("octaveRangeValue").textContent = this.value;
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const selectedKeys = Array.from(document.querySelectorAll("input[name='keys']:checked"))
    .map(el => el.value);
  const useRhythms = document.getElementById("useRhythms").checked;
  const useIntervals = document.getElementById("useIntervals").checked;
  const numMeasures = parseInt(document.getElementById("numMeasures").value);
  const octaveRange = parseInt(document.getElementById("octaveRange").value);  // NEW

  try {
    const res = await fetch("https://tinquilts-backend.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selected_keys: selectedKeys,
        selected_rhythms: useRhythms,
        use_intervals: useIntervals,
        num_measures: numMeasures,
        octave_range: octaveRange  // NEW
      })
    });

    if (!res.ok) throw new Error("Failed to generate etude.");

    const data = await res.json();
    const etude = data.etude;

    const output = document.getElementById("output");
    output.innerHTML = "";

    const VF = Vex.Flow;
    const renderer = new VF.Renderer(output, VF.Renderer.Backends.SVG);
    renderer.resize(800, 150 + numMeasures * 25);  // NEW: auto-resize
    const context = renderer.getContext();

    const notesPerLine = 16;  // NEW: wrap every 16 notes
    for (let i = 0; i < etude.length; i += notesPerLine) {
      const slice = etude.slice(i, i + notesPerLine);
      const stave = new VF.Stave(10, 40 + i * 5, 700);
      stave.addClef("treble");

      // Skip invalid key signature for Chromatic
      if (selectedKeys.length > 0 && selectedKeys[0] !== "Chromatic") {
        stave.addKeySignature(selectedKeys[0]);
      }

      stave.setContext(context).draw();

      const vexNotes = slice.map(({ note, duration }) => {
        const key = note.replace(/(\d)/, "/$1").toLowerCase();
        return new VF.StaveNote({ keys: [key], duration });
      });

      const voice = new VF.Voice({ num_beats: 4 * (slice.length / 4), beat_value: 4 });
      voice.addTickables(vexNotes);
      new VF.Formatter().joinVoices([voice]).format([voice], 600);
      voice.draw(context, stave);
    }
  } catch (err) {
    document.getElementById("output").textContent = `Error: ${err.message}`;
  }
});
