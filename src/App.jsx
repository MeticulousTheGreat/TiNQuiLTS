import React, { useState } from 'react';
import axios from 'axios';

const API_URL = "https://tinquilts-backend.onrender.com/generate";

const App = () => {
  const [keys, setKeys] = useState([]);
  const [rhythms, setRhythms] = useState(false);
  const [intervals, setIntervals] = useState(false);
  const [measures, setMeasures] = useState(4);
  const [tempo, setTempo] = useState(120);
  const [etude, setEtude] = useState([]);

  const handleKeyChange = (key) => {
    setKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(API_URL, {
        keys,
        rhythms,
        intervals,
        measures,
        tempo
      });
      setEtude(response.data.etude);
    } catch (error) {
      console.error("Error generating etude:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>TiNQuiLTS Sightreading</h1>
      <h3>Select Keys</h3>
      {['Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#'].map(key => (
        <label key={key} style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={keys.includes(key)}
            onChange={() => handleKeyChange(key)}
          />
          {key}
        </label>
      ))}

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={rhythms}
            onChange={() => setRhythms(!rhythms)}
          /> Rhythms
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="checkbox"
            checked={intervals}
            onChange={() => setIntervals(!intervals)}
          /> Intervals
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Measures: {measures}</label>
        <input
          type="range"
          min="1"
          max="16"
          value={measures}
          onChange={e => setMeasures(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Tempo: {tempo} BPM</label>
        <input
          type="range"
          min="40"
          max="240"
          value={tempo}
          onChange={e => setTempo(Number(e.target.value))}
        />
      </div>

      <button style={{ marginTop: 20 }} onClick={handleSubmit}>
        Generate Etude
      </button>

      {etude.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Generated Etude</h3>
          <pre>{etude.map(([note, dur], i) => `${note} (${dur})`).join('\n')}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
