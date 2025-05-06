import React, { useState } from "react";

const API_URL = "https://tinquilts-backend.onrender.com";

function App() {
  const [keys, setKeys] = useState(["C"]);
  const [rhythms, setRhythms] = useState(["eighth"]);
  const [intervals, setIntervals] = useState(false);
  const [measures, setMeasures] = useState(4);
  const [etude, setEtude] = useState(null);

  const generateEtude = async () => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys, rhythms, intervals, measures })
    });
    const data = await res.json();
    setEtude(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>TiNQuiLTS Sightreading</h1>
      <div>
        <button onClick={generateEtude}>Generate Etude</button>
      </div>
      {etude && (
        <div>
          <h2>Key: {etude.key}</h2>
          <ul>
            {etude.etude.map(([note, duration], i) => (
              <li key={i}>{note} ({duration} beats)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
