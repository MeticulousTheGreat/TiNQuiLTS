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
    etude = []
    keys = data.keys
    rhythms = data.rhythms
    use_intervals = data.intervals
    total_notes = data.measures * 4  # Assuming 4/4 time (one note per beat for now)

    # Rhythm-only etude: no key, no intervals
    if not keys and rhythms and not use_intervals:
        for _ in range(total_notes):
            duration = random.choice(rhythms)
            etude.append(("C4", duration))  # Fixed note for percussion display
        return {"etude": etude}

    # Handle general case
    if not keys:
        keys = ["C"]

    for _ in range(total_notes):
        key = random.choice(keys)
        scale = SCALE_NOTES.get(key, SCALE_NOTES["C"])

        if use_intervals:
            start_index = random.randint(0, len(scale) - 1)
            jump_range = random.randint(1, min(7, len(scale)-1))  # up to octave
            direction = random.choice([-1, 1])
            target_index = (start_index + direction * jump_range) % len(scale)
            note = scale[target_index]
        else:
            # Scalar run
            if 'last_note_index' not in locals():
                last_note_index = random.randint(0, len(scale) - 1)
            direction = random.choice([-1, 1])
            last_note_index = (last_note_index + direction) % len(scale)
            note = scale[last_note_index]

        octave = 4  # You could make this user-selectable later
        duration = random.choice(rhythms) if rhythms else "q"
        etude.append((f"{note}{octave}", duration))

    return {"etude": etude}
