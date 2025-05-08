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

    const VF = Vex.Flow;
    const factory = new VF.Factory({
      renderer: {
        elementId: "output",
        width: 900,
        height: 150 + 120 * Math.ceil(etude.length / 16),
      }
    });

    const score = factory.EasyScore();
    const system = factory.System();
    const voices = [];
    const measures = [];
    let measureNotes = [];

    let currentBeats = 0;
    const beatsPerMeasure = 4;

    // Group notes into measures based on rhythm durations
    for (let i = 0; i < etude.length; i++) {
      const { note, duration } = etude[i];
      const beat = { "q": 1, "8": 0.5, "16": 0.25 }[duration];
      const key = note.toLowerCase();

      if (currentBeats + beat > beatsPerMeasure) {
        // Pad current measure with rests
        const pad = beatsPerMeasure - currentBeats;
        while (currentBeats < beatsPerMeasure) {
          if (pad >= 1) {
            measureNotes.push("b4/q");
            currentBeats += 1;
          } else if (pad >= 0.5) {
            measureNotes.push("b4/8");
            currentBeats += 0.5;
          } else {
            measureNotes.push("b4/16");
            currentBeats += 0.25;
          }
        }
        measures.push(measureNotes.join(" "));
        measureNotes = [];
        currentBeats = 0;
      }

      measureNotes.push(`${key}/${duration}`);
      currentBeats += beat;
    }

    // Final measure
    if (measureNotes.length > 0) {
      while (currentBeats < beatsPerMeasure) {
        if (beatsPerMeasure - currentBeats >= 1) {
          measureNotes.push("b4/q");
          currentBeats += 1;
        } else if (beatsPerMeasure - currentBeats >= 0.5) {
          measureNotes.push("b4/8");
          currentBeats += 0.5;
        } else {
          measureNotes.push("b4/16");
          currentBeats += 0.25;
        }
      }
      measures.push(measureNotes.join(" "));
    }


    
    //draw staves with easy score
    for (let i = 0; i < measures.length; i++) {
      const stave = system.addStave({
        voices: [score.voice(score.notes(measures[i]))]
      });

      if (i === 0) {
        stave.addClef("treble");
        if (selectedKeys.length > 0 && selectedKeys[0] !== "Chromatic") {
          stave.addKeySignature(selectedKeys[0]);
        }
      }
    }

    factory.draw();

  } catch (err) {
    document.getElementById("output").textContent = `Error: ${err.message}`;
  }
});
