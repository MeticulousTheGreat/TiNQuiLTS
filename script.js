window.addEventListener("DOMContentLoaded", () => {
  const VF = Vex.Flow;
  const { Track, Writer, NoteEvent } = MidiWriter;

  const durations = ["q", "8"];
  const durationBeats = { "q": 1, "8": 0.5 };
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
      const dur = useRhythms ? durations[Math.floor(Math.random() * durations.length)] : "q";
      let beatValue = durationBeats[dur];

      if (currentBeats + beatValue > totalBeats) {
        beatValue = totalBeats - currentBeats;
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

      notes.push({ pitch: note + octave, duration: dur });
      currentBeats += beatValue;
    }

    document.getElementById("debugger").innerHTML = stringify(notes, key);
    renderNotation(notes, key);
    generateMIDI(notes);
    
  });

  function noteToMidi(note) {
    const map = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };
    return map[note];
  }

  function renderNotation(notes, keySignature) {
    const output = document.getElementById("output");
    output.innerHTML = "";
    const factory = new VF.Factory({
      renderer: { elementId: "output", width: 900, height: 250 }
    });
    const score = factory.EasyScore();
    const system = factory.System();

    const measures = [];
    let current = [];
    let beats = 0;
    for (let n of notes) {
      const beat = durationBeats[n.duration];
      if (beats + beat > beatsPerMeasure) {
        measures.push(current.join(" "));
        current = [];
        beats = 0;
      }
      current.push(`${n.pitch.toLowerCase()}/${n.duration}`);
      beats += beat;
    }
    if (current.length) measures.push(current.join(" "));

    for (let i = 0; i < measures.length; i++) {
      const stave = system.addStave({
        voices: [score.voice(score.notes(measures[i]))]
      });
      if (i === 0) {
        stave.addClef("treble");
        if (keySignature !== "Chromatic") {
          stave.addKeySignature(keySignature);
        }
      }
    }

    factory.draw();
  }

  function generateMIDI(notes) {
    const track = new Track();
    notes.forEach(n => {
      track.addEvent(new NoteEvent({
        pitch: [n.pitch],
        duration: n.duration === "q" ? "4" : "8"
      }));
    });

    const write = new Writer([track]);
    const blob = new Blob([write.buildFile()], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);

    const audioLink = document.getElementById("midiLink");
    audioLink.href = url;
    audioLink.textContent = "Download / Play MIDI";
    audioLink.style.display = "inline";
  }
});
