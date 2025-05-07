import random
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scale definitions
SCALE_NOTES = {
    "C":  ["C", "D", "E", "F", "G", "A", "B"],
    "G":  ["G", "A", "B", "C", "D", "E", "F#"],
    "D":  ["D", "E", "F#", "G", "A", "B", "C#"],
    "A":  ["A", "B", "C#", "D", "E", "F#", "G#"],
    "E":  ["E", "F#", "G#", "A", "B", "C#", "D#"],
    "B":  ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
    "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
    "F":  ["F", "G", "A", "Bb", "C", "D", "E"],
    "Chromatic": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
}

class EtudeRequest(BaseModel):
    keys: list[str]
    rhythms: list[str]
    intervals: bool
    measures: int

@app.post("/generate-etude")
async def generate_etude(data: EtudeRequest):
    selected_keys = config.get("selectedKeys", [])
    selected_rhythms = config.get("selectedRhythms", False)
    use_intervals = config.get("useIntervals", False)
    num_measures = config.get("numMeasures", 4)
    beats_per_measure = 4

    total_beats = num_measures * beats_per_measure
    etude = []

    if not selected_keys and selected_rhythms:
        # Rhythm-only mode: use a percussion line
        beats_remaining = total_beats
        while beats_remaining > 0:
            dur = random.choice(DURATIONS)
            dur_val = {"q": 1, "8": 0.5, "16": 0.25}[dur]
            if dur_val <= beats_remaining:
                etude.append({"note": "x/0", "duration": dur})
                beats_remaining -= dur_val
        return etude

    # Pick one key for this etude (if any); if none, default to C
    key = random.choice(selected_keys) if selected_keys else "C"
    scale = SCALE_NOTES.get(key, SCALE_NOTES["C"])

    # Generate notes
    beats_remaining = total_beats
    prev_idx = random.randint(0, len(scale) - 1)

    while beats_remaining > 0:
        dur = "q"  # default duration
        dur_val = 1.0

        if selected_rhythms:
            dur = random.choice(DURATIONS)
            dur_val = {"q": 1, "8": 0.5, "16": 0.25}[dur]

        if dur_val > beats_remaining:
            continue  # skip this one and try a smaller duration

        # Determine next note
        if use_intervals:
            # Jump anywhere from a second to an octave
            jump = random.randint(-7, 7)
            next_idx = (prev_idx + jump) % len(scale)
        else:
            # Stepwise motion (up/down one scale degree)
            step = random.choice([-1, 1])
            next_idx = (prev_idx + step) % len(scale)

        note = scale[next_idx] + "4"  # All notes in octave 4 for simplicity
        etude.append({"note": note, "duration": dur})
        prev_idx = next_idx
        beats_remaining -= dur_val

    #return etude
    return {"etude": etude}
