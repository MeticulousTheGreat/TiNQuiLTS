import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, PlayCircle, Mic } from 'lucide-react';
import * as Tone from 'tone';
import OpenSheetMusicDisplay from 'opensheetmusicdisplay';

export default function EtudePractice() {
  const [settings, setSettings] = useState({
    rhythm: true,
    keys: ['C', 'Bb'],
    jumps: true,
    measures: 4,
    transpose: 'C'
  });
  const [tempo, setTempo] = useState(100);
  const [etude, setEtude] = useState(null);
  const osmdRef = useRef(null);
  const containerRef = useRef(null);

  const fetchEtude = async () => {
    const res = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setEtude(data);
  };

  useEffect(() => {
    if (etude) {
      const osmd = new OpenSheetMusicDisplay(containerRef.current);
      fetch(`http://localhost:5000${etude.musicxml}`)
        .then(res => res.text())
        .then(xml => {
          osmd.load(xml).then(() => osmd.render());
          osmdRef.current = osmd;
        });
    }
  }, [etude]);

  const playMidi = async () => {
    await Tone.start();
    const midiUrl = `http://localhost:5000${etude.midi}`;
    const response = await fetch(midiUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = await Tone.Midi.fromUrl(midiUrl);

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    Tone.Transport.bpm.value = tempo;

    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        Tone.Transport.schedule(time => {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }, note.time);
      });
    });

    Tone.Transport.start();
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Main Menu</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Keys</Label>
              <Input
                value={settings.keys.join(',')}
                onChange={(e) => setSettings({ ...settings, keys: e.target.value.split(',') })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.rhythm}
                onCheckedChange={(val) => setSettings({ ...settings, rhythm: val })}
              />
              <Label>Include Rhythms</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.jumps}
                onCheckedChange={(val) => setSettings({ ...settings, jumps: val })}
              />
              <Label>Include Jumps</Label>
            </div>
            <div>
              <Label>Measures: {settings.measures}</Label>
              <Slider
                min={2}
                max={16}
                value={[settings.measures]}
                onValueChange={([val]) => setSettings({ ...settings, measures: val })}
              />
            </div>
          </div>
          <Button onClick={fetchEtude}>Generate Etude</Button>
        </CardContent>
      </Card>

      {etude && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label>Tempo: {tempo} BPM</Label>
            <Slider min={40} max={200} value={[tempo]} onValueChange={([val]) => setTempo(val)} />
            <Button onClick={playMidi}>
              <PlayCircle className="mr-2" /> Play Correct
            </Button>
            <Button variant="secondary">
              <Mic className="mr-2" /> Record + Playback
            </Button>
            <Button variant="ghost" onClick={fetchEtude}>
              <RotateCcw className="mr-2" /> Next Etude
            </Button>
          </div>
          <div ref={containerRef} className="bg-white rounded shadow p-4"></div>
        </div>
      )}
    </div>
  );
}
