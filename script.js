window.addEventListener("DOMContentLoaded", () => {
  
  const divisions = ["4", "8"];
  function durationBeats(dur){
     return 4 / dur;
  };
  const beatsPerMeasure = 4;

  const SCALE_NOTES = {
    "C":  ["C", "D", "E", "F", "G", "A", "B"],
    "G":  ["G", "A", "B", "C", "D", "E", "F#"],
    "D":  ["D", "E", "F#", "G", "A", "B", "C#"],
    "A":  ["A", "B", "C#", "D", "E", "F#", "G#"],
    "E":  ["E", "F#", "G#", "A", "B", "C#", "D#"],
    "B":  ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
    "F":  ["F", "G", "A", "Bb", "C", "D", "E"],
    "Chromatic": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  };

  document.getElementById("numMeasures").addEventListener("input", function () {
    document.getElementById("measureValue").textContent = this.value;
  });

  document.getElementById("octaveRange").addEventListener("input", function () {
    document.getElementById("octaveRangeValue").textContent = this.value;
  });


  function noteToMidi(note) {
    const map = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };
    return map[note];
  }

  function renderABC(notes, key, numMeasures) {
    const abcL = 8
    const header = `X:1\nT:ts etude pmo\nM:4/4\nK:${key === "Chromatic" ? "C" : key}\nL:1/`+ abcL +`\n`;

    const abcNotes = [];
    let measureBeat = 0;

    for (let n of notes) {
      const dur = n.division === "4" ? 1 : 0.5;
      let abcDur = n.division / 4 === 1 ? "" : ""; // L:1/8, so "4" is 2, "8" is 1
      if (dur === 1) abcDur = "2";
      const pitch = abcjsPitch(n.pitch);
      abcNotes.push(pitch + abcDur);
      measureBeat += dur;
  
      if (measureBeat >= beatsPerMeasure) {
        abcNotes.push("|");
        measureBeat = 0;
      }
    }

    const abcString = header + abcNotes.join(" ") + " |]";
    ABCJS.renderAbc("abcNotation", abcString, {}, {});

    document.getElementById("rawNotation").innerHTML = abcString;

    // Add synth playback
    ABCJS.renderMidi("abcControls", abcString, {
      generateDownload: true,
      inlineControls: true,
      responsive: "resize"
    });
  }

  function abcjsPitch(note) {
    const [letter, octaveStr] = note.match(/[A-Ga-g#b]+|\d+/g);
    const octave = parseInt(octaveStr);
    const base = letter.replace("b", "_").replace("#", "^");
    if (octave < 5) return base.toLowerCase().repeat(6 - octave);
    if (octave === 5) return base;
    return base.toLowerCase() + "'".repeat(octave - 5);
  }


  
  document.getElementById("generateBtn").addEventListener("click", () => {
    const selectedKeys = Array.from(document.querySelectorAll("input[name='keys']:checked")).map(k => k.value);
    const useRhythms = document.getElementById("useRhythms").checked;
    const useIntervals = document.getElementById("useIntervals").checked;
    const numMeasures = parseInt(document.getElementById("numMeasures").value);
    const octaveRange = parseInt(document.getElementById("octaveRange").value);
    const centerOctave = 4;

    const totalBeats = numMeasures * beatsPerMeasure;
    const key = selectedKeys.length ? selectedKeys[Math.floor(Math.random() * selectedKeys.length)] : "C";
    const scale = SCALE_NOTES[key];

    const notes = [];
    let currentBeats = 0;
    let index = Math.floor(Math.random() * scale.length);
    let octave = centerOctave;

    while (currentBeats < totalBeats) {
      const dur = useRhythms ? divisions[Math.floor(Math.random() * divisions.length)] : "4";
      let beatValue = durationBeats(dur);

      if (currentBeats + beatValue > totalBeats) {
        beatValue = totalBeats - currentBeats;      // used to be continue
      }

      const jump = useIntervals ? Math.floor(Math.random() * 15) - 7 : (Math.random() < 0.5 ? -1 : 1);
      index = (index + jump + scale.length) % scale.length;
      let note = scale[index];

      let midiNum = 12 * octave + noteToMidi(note);
      const minMidi = 12 * centerOctave - (6 * octaveRange);
      const maxMidi = 12 * centerOctave + (6 * octaveRange);
      if (midiNum < minMidi || midiNum > maxMidi) {
        octave = centerOctave;
      }

      notes.push({ pitch: note + octave, division: dur });
      currentBeats += beatValue;
    }

    document.getElementById("debugger").innerHTML = JSON.stringify(key) + "<br>" + JSON.stringify(notes);
    renderABC(notes, key, numMeasures);
  });
  
});
