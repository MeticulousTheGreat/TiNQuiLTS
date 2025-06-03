window.addEventListener("DOMContentLoaded", () => {

  let notes = []
  let key = "C"
  
  const divisions = ["4", "8"];
  function divToDur(div){return 4 / div};
  function durToDiv(dur){return 4 / dur};
  const meterTop = 4;
  const meterBottom = 4;
  const abcL = 8;
  const LPerMeasure =  meterTop * abcL / meterBottom;
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



  
  document.getElementById("numMeasures").addEventListener("input", function () {        //update measures
    document.getElementById("measureValue").textContent = this.value;
  });

  document.getElementById("octaveRange").addEventListener("input", function () {        //update range
    document.getElementById("octaveRangeValue").textContent = this.value;
  });

  document.getElementById("centerOctave").addEventListener("input", function () {        //update center of range
    document.getElementById("centerOctaveValue").textContent = this.value;
  });

  document.getElementById("tempoSlider").addEventListener("input", function () {        //update tempo
    document.getElementById("tempoValue").textContent = this.value;
  });
  
  function noteToMidi(note) {
    const map = { C:0, "C#":1, Db:1, D:2, "D#":3, Eb:3, E:4, F:5, "F#":6, Gb:6, G:7, "G#":8, Ab:8, A:9, "A#":10, Bb:10, B:11 };
    return map[note];
  }


  
  function notesToABC(notes, key, numMeasures) {
    const header = `X:1\nT:ts etude pmo\nM:`+ meterTop +`/`+ meterBottom +`\nK:${key === "Chromatic" ? "C" : key}\nL:1/`+ abcL +`\n`;

    const abcNotes = [];
    let measureBeat = 0;

    for (let n of notes) {
      let abcBeats = abcL / n.division; // e.g. abcL=8, division=4 → 2 beats
      let pitch = abcjsPitch(n.pitch);

      while (abcBeats > 0) {
        const remaining = LPerMeasure - measureBeat;

        if (abcBeats > remaining) {
          // Split the note: first part fits this measure, second will spill over
          abcNotes.push(pitch + getABCDuration(remaining) + "-");
          abcNotes.push("|");
          abcBeats -= remaining;
          measureBeat = 0;
        } else {
          // Whole note fits in current measure
          abcNotes.push(pitch + getABCDuration(abcBeats));
          measureBeat += abcBeats;
          abcBeats = 0;

          if (measureBeat === LPerMeasure) {
            abcNotes.push("|");
            measureBeat = 0;
          }
        }
      }
    }

    // Final bar if needed
    if (abcNotes[abcNotes.length - 1] !== "|") {
      abcNotes.push("|");
    }

    return header + abcNotes.join(" ") + " ]";
  }


  function getABCDuration(abcBeats) {
    if (abcBeats === 1) return "";
    return abcBeats;
  }
  
  
  function abcjsPitch(note) {
    const [letter, octaveStr] = note.match(/[A-Ga-g#b]+|\d+/g);
    const octave = parseInt(octaveStr);
  
    // Accidental goes before the letter in ABC
    let baseLetter = letter[0].toUpperCase();
    let accidental = "";
  
    if (letter.includes("b")) accidental = "_";
    if (letter.includes("#")) accidental = "^";

    const base = accidental + baseLetter;

    // Map octave
    if (octave < 4) return base + ",".repeat(4 - octave);     // C3 → C,
    if (octave === 4) return base;                            // C4 → C
    return base.toLowerCase() + "'".repeat(octave - 5);       // C5 → c and C6 to c'
  }



  
  let convertedABC = {}



  
  document.getElementById("generateBtn").addEventListener("click", () => {
    const selectedKeys = Array.from(document.querySelectorAll("input[name='keys']:checked")).map(k => k.value);
    const useRhythms = document.getElementById("useRhythms").checked;
    const doJumps = document.getElementById("doJumps").checked;
    const numMeasures = parseInt(document.getElementById("numMeasures").value);
    const octaveRange = parseInt(document.getElementById("octaveRange").value);
    const centerOctave = parseInt(document.getElementById("centerOctave").value);

    const totalBeats = numMeasures * meterTop;
    key = selectedKeys.length ? selectedKeys[Math.floor(Math.random() * selectedKeys.length)] : "C";
    const scale = SCALE_NOTES[key];

    notes = [];
    let currentBeats = 0;
    let index = Math.floor(Math.random() * scale.length);
    //let octave = centerOctave;

    let noteObj = { note: scale[index], octave: centerOctave };
    const centerMidi = 12 * centerOctave + noteToMidi("A");
    const minMidi = centerMidi - Math.floor(12 * octaveRange);
    const maxMidi = centerMidi + Math.floor(12 * octaveRange);

    
    while (currentBeats < totalBeats) {
      let div = useRhythms ? divisions[Math.floor(Math.random() * divisions.length)] : "4";
      let beatValue = divToDur(div);

      if (currentBeats + beatValue > totalBeats) {
        beatValue = totalBeats - currentBeats;
        console.log(beatValue);
        div = durToDiv(beatValue);
      }

    
      const interval = doJumps ? Math.floor(Math.random() * 15) - 7 : (Math.random() < 0.5 ? 1 : -1);
      let newIndex = (scale.indexOf(noteObj.note) + interval + scale.length) % scale.length;
      let newOctave = noteObj.octave + Math.floor((scale.indexOf(noteObj.note) + interval) / scale.length);
      let candidate = { note: scale[newIndex], octave: newOctave };

      let midiValue = noteToMidi(candidate.note) + 12 * candidate.octave;
      if (midiValue < minMidi || midiValue > maxMidi) {
        // Flip interval and retry
        const flippedInterval = -interval;
        newIndex = (scale.indexOf(noteObj.note) + flippedInterval + scale.length) % scale.length;
        newOctave = noteObj.octave + Math.floor((scale.indexOf(noteObj.note) + flippedInterval) / scale.length);
        candidate = { note: scale[newIndex], octave: newOctave };
      }

      notes.push({ pitch: candidate.note + candidate.octave, division: div });
      noteObj = candidate;
      currentBeats += beatValue;
    }

    console.log("Generated key and notes:<br>" + JSON.stringify(key) + "<br>" + JSON.stringify(notes));
    prepVisual();
  });

  
  document.getElementById("prepBtn").addEventListener("click", () => {
    prepVisual();
    playAudio();
  });
    
  function prepVisual () {
    if (currentSynth) {
      currentSynth.stop();
      currentSynth = null;
    }
    currentSynth = new ABCJS.synth.CreateSynth();
    
    const tempo = parseInt(document.getElementById("tempoSlider").value);
    convertedABC = `Q: 1/4=${tempo} \n` + notesToABC(notes, key, numMeasures)
    document.getElementById("rawNotation").innerHTML = convertedABC;
    currentSynth.init({visualObj: ABCJS.renderAbc("paper", convertedABC)[0]});
  }

  let currentSynth = null;
  
  function playAudio () {

    
    var visualOptions = { responsive: 'resize' };  //vestigial?
    
    
      if (ABCJS.synth && ABCJS.synth.CreateSynth) {
              currentSynth = new ABCJS.synth.CreateSynth();
          currentSynth.init({ 
              visualObj: ABCJS.renderAbc("paper", convertedABC)[0]
          }).then(() => {
              currentSynth.prime().then(() => {
                  currentSynth.start();
              });
          });
      } else {
          alert('Audio synthesis not available in this version of ABC.js');
      };
  };
  
});
