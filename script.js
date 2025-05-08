document.getElementById("tempo").addEventListener("input", function () {
  document.getElementById("tempoValue").textContent = this.value;
});

document.getElementById("numMeasures").addEventListener("input", function () {
  document.getElementById("measureValue").textContent = this.value;
});

document.getElementById("octaveRange").addEventListener("input", function () {
  document.getElementById("octaveRangeValue").textContent = this.value;
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const selectedKeys = Array.from(document.querySelectorAll("input[name='keys']:checked"))
    .map(el => el.value);
  const useRhythms = document.getElementById("useRhythms").checked;
  const useIntervals = document.getElementById("useIntervals").checked;
  const numMeasures = parseInt(document.getElementById("numMeasures").value);
  const octaveRange = parseInt(document.getElementById("octaveRange").value);

  try {
    const res = await fetch("https://tinquilts-backend.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selected_keys: selectedKeys,
        selected_rhythms: useRhythms,
        use_intervals: useIntervals,
        num_measures: numMeasures,
        octave_range: octaveRange
      })
    });

    if (!res.ok) throw new Error("Failed to generate etude.");

    const data = await res.json();
    const etude = data.etude;

    const output = document.getElementById("output");
    output.innerHTML = "";

    const VF = Vexflow;
    const renderer = new VF.Renderer(output, VF.Renderer.Backends.SVG);
    renderer.resize(1000, 150 + numMeasures * 40);
    const context = renderer.getContext();

    const staveWidth = 900;
    const beatsPerMeasure = 4;
    let currentY = 40;
    let beatCount = 0;
    let notesInMeasure = [];

    const drawStave = (notes, isFirstMeasure) => {
      const stave = new VF.Stave(10, currentY, staveWidth);
      stave.addClef("treble");
      if (isFirstMeasure && selectedKeys.length > 0 && selectedKeys[0] !== "Chromatic") {
        stave.addKeySignature(selectedKeys[0]);
      }
      stave.setContext(context).draw();

      const voice = new VF.Voice({ num_beats: beatsPerMeasure, beat_value: 4 });
      voice.setMode(VF.Voice.Mode.STRICT);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
      voice.draw(context, stave);

      currentY += 120;
    };

    for (let i = 0; i < etude.length; i++) {
      const { note, duration } = etude[i];
      const key = note.replace(/(\d)/, "/$1").toLowerCase();
      const staveNote = new VF.StaveNote({
        keys: [key],
        duration: duration
      });

      // Add accidentals manually
      if (key.includes("#")) {
        staveNote.addModifier(0, new VF.Accidental("#"));
      } else if (key.includes("b")) {
        staveNote.addModifier(0, new VF.Accidental("b"));
      }

      notesInMeasure.push(staveNote);
      beatCount += { "q": 1, "8": 0.5, "16": 0.25 }[duration];

      if (beatCount >= beatsPerMeasure) {
        drawStave(notesInMeasure, i < beatsPerMeasure);
        notesInMeasure = [];
        beatCount = 0;
      }
    }

    if (notesInMeasure.length > 0) {
      drawStave(notesInMeasure, false);
    }

  } catch (err) {
    document.getElementById("output").textContent = `Error: ${err.message}`;
  }
});
