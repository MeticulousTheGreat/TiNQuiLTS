window.addEventListener("DOMContentLoaded", () => {
  
  const divisions = ["4", "8"];
  function durationBeats(dur){return 4 / dur};
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
    const abcL = 8
    const header = `X:1\nT:ts etude pmo\nM:4/4\nK:${key === "Chromatic" ? "C" : key}\nL:1/`+ abcL +`\n`;

    const abcNotes = [];
    let measureBeat = 0;

    for (let n of notes) {                                                             // this for loop needs some work for generalization and readability
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
    return abcString
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

    const totalBeats = numMeasures * beatsPerMeasure;
    const key = selectedKeys.length ? selectedKeys[Math.floor(Math.random() * selectedKeys.length)] : "C";
    const scale = SCALE_NOTES[key];

    const notes = [];
    let currentBeats = 0;
    let index = Math.floor(Math.random() * scale.length);
    //let octave = centerOctave;

    let noteObj = { note: scale[index], octave: centerOctave };
    const centerMidi = 12 * centerOctave + noteToMidi("A");
    const minMidi = centerMidi - Math.floor(12 * octaveRange);
    const maxMidi = centerMidi + Math.floor(12 * octaveRange);

    
    while (currentBeats < totalBeats) {
      const dur = useRhythms ? divisions[Math.floor(Math.random() * divisions.length)] : "4";
      let beatValue = durationBeats(dur);

      if (currentBeats + beatValue > totalBeats) {
        beatValue = totalBeats - currentBeats;      // maybe continue would also work?
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

      notes.push({ pitch: candidate.note + candidate.octave, division: dur });
      noteObj = candidate;
      currentBeats += beatValue;
    }

    console.log("Generated key and notes:<br>" + JSON.stringify(key) + "<br>" + JSON.stringify(notes));

    convertedABC = notesToABC(notes, key, numMeasures)
    document.getElementById("rawNotation").innerHTML = convertedABC;    
    prepAudio()
  });

  
  document.getElementById("prepBtn").addEventListener("click", () => {
    prepAudio()
  });
    
    
  function prepAudio () {
    const tempo = parseInt(document.getElementById("tempoSlider").value);
          
    var visualOptions = { responsive: 'resize' };
    var visualObj = ABCJS.renderAbc("paper", convertedABC, visualOptions);
    
    if (ABCJS.synth.supportsAudio()) {
        var controlOptions = {
            displayRestart: true,
            displayPlay: true,
            displayLoop: true
        };
        var synthControl = new ABCJS.synth.SynthController();
        synthControl.load("#audio", null, controlOptions);
        synthControl.disable(true);
        var midiBuffer = new ABCJS.synth.CreateSynth();
        midiBuffer.init({
            visualObj: visualObj[0],
            millisecondsPerMeasure: (beatsPerMeasure * 60000 / tempo),
            options: {
                
            }

        }).then(function () {
            synthControl.setTune(visualObj[0], true).then(function (response) {
            document.querySelector(".abcjs-inline-audio").classList.remove("disabled");
            })
        });
    } else {
        console.log("audio is not supported on this browser");
    };


    
  };
  
});
