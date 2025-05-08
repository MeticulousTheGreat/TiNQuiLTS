import random

# Define scale notes for 12 major keys + Chromatic
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

# Supported rhythm durations and their beat values
DURATION_VALUES = {
    "q": 1.0,
    "8": 0.5,
    "16": 0.25
}
DURATIONS = list(DURATION_VALUES.keys())

def generate_etude(config):
    # Extract parameters from the frontend
    selected_keys = config.get("selected_keys", [])
    selected_rhythms = config.get("selected_rhythms", False)
    use_intervals = config.get("use_intervals", False)
    num_measures = config.get("num_measures", 4)

    beats_per_measure = 4
    total_beats = num_measures * beats_per_measure

    etude = []

    # Default to C if no key is selected
    key = random.choice(selected_keys) if selected_keys else "C"
    scale = SCALE_NOTES.get(key, SCALE_NOTES["C"])

    # Start from a random note index
    current_index = random.randint(0, len(scale) - 1)
    beats_remaining = total_beats

    while beats_remaining > 0:
        # Select a rhythm duration
        if selected_rhythms:
            duration = random.choice(DURATIONS)
            dur_value = DURATION_VALUES[duration]
        else:
            duration = "q"
            dur_value = 1.0

        if dur_value > beats_remaining:
            continue  # try again         NOTE: This may loop forever if there is not a small enough duration e.g. triplets maybe!

        # Determine next note index
        if use_intervals:
            jump = random.randint(-7, 7)  # interval up to an octave
        else:
            jump = random.choice([-1, 1])  # stepwise

        current_index = (current_index + jump) % len(scale)
        note_name = scale[current_index] + "4"  # octave fixed for now

        # Append note and duration
        etude.append({
            "note": note_name,
            "duration": duration
        })

        beats_remaining -= dur_value

    return etude
