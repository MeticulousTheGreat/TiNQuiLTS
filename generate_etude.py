import random

SCALE_NOTES = {
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
}

DURATION_VALUES = { "q": 1.0, "8": 0.5, "16": 0.25 }
DURATIONS = list(DURATION_VALUES.keys())

NOTE_TO_MIDI = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
    "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8,
    "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
}

def note_to_midi(note, octave):
    return NOTE_TO_MIDI[note] + 12 * octave

def midi_to_note(midi_num):
    octave = midi_num // 12
    note_val = midi_num % 12
    for name, val in NOTE_TO_MIDI.items():
        if val == note_val:
            return f"{name}{octave}"
    return "C4"

def generate_etude(config):
    selected_keys = config.get("selected_keys", [])
    selected_rhythms = config.get("selected_rhythms", False)
    use_intervals = config.get("use_intervals", False)
    num_measures = config.get("num_measures", 4)
    octave_range = config.get("octave_range", 2)
    center_midi = 69  # A4

    beats_per_measure = 4
    total_beats = num_measures * beats_per_measure
    etude = []

    key = random.choice(selected_keys) if selected_keys else "C"
    scale = SCALE_NOTES.get(key, SCALE_NOTES["C"])

    index = random.randint(0, len(scale) - 1)
    current_octave = 4
    beats_remaining = total_beats

    while beats_remaining > 0:
        duration = "q"
        dur_val = 1.0

        if selected_rhythms:
            duration = random.choice(DURATIONS)
            dur_val = DURATION_VALUES[duration]
        if dur_val > beats_remaining:
            continue

        jump = random.randint(-7, 7) if use_intervals else random.choice([-1, 1])
        next_index = (index + jump) % len(scale)
        note_name = scale[next_index]

        target_midi = note_to_midi(note_name, current_octave)
        min_midi = center_midi - (6 * octave_range)
        max_midi = center_midi + (6 * octave_range)
        if target_midi < min_midi or target_midi > max_midi:
            jump *= -1
            next_index = (index + jump) % len(scale)
            note_name = scale[next_index]
            target_midi = note_to_midi(note_name, current_octave)

        note = midi_to_note(target_midi)
        etude.append({ "note": note, "duration": duration })

        beats_remaining -= dur_val
        index = next_index

    return etude
