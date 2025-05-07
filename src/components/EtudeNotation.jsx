// src/components/EtudeNotation.jsx
import React, { useEffect, useRef } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";

const EtudeNotation = ({ etude, showRhythmOnly }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!etude || etude.length === 0) return;

    // Clear existing rendering
    containerRef.current.innerHTML = "";

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(600, 200);
    const context = renderer.getContext();

    // Use one-line staff for rhythm-only
    const stave = new Stave(10, 40, 580);
    if (showRhythmOnly) {
      stave.addClef("percussion");
    } else {
      stave.addClef("treble");
    }
    stave.setContext(context).draw();

    const vexNotes = etude.map(([note, duration]) => {
      let keys = showRhythmOnly ? ["c/5"] : [note.replace(/(\d)/, "/$1")]; // e.g. C4 → c/4
      return new StaveNote({
        keys: keys,
        duration: duration,
        clef: showRhythmOnly ? "percussion" : "treble",
      });
    });

    const voice = new Voice({ num_beats: etude.length, beat_value: 4 });
    voice.addTickables(vexNotes);

    new Formatter().joinVoices([voice]).format([voice], 500);
    voice.draw(context, stave);
  }, [etude, showRhythmOnly]);

  return <div ref={containerRef}></div>;
};

export default EtudeNotation;
