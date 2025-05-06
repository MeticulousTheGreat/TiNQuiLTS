import random

SCALE_NOTES = {
    "C": ["C", "D", "E", "F", "G", "A", "B"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
    "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"]
}

RHYTHMS = {
    "quarter": 1.0,
    "eighth": 0.5,
    "half": 2.0
}

def generate_etude(selected_keys, selected_rhythms, use_intervals, num_measures, beats_per_measure=4):
    key = random.choice(selected_keys) if selected_keys else "C"
    scale = SCALE_NOTES.get(key, SCALE_NOTES["C"])
    rhythm_values = [RHYTHMS[r] for r in selected_rhythms] if selected_rhythms else [1.0]

    etude = []
    current_note = random.choice(scale)
    remaining_beats = num_measures * beats_per_measure

    while remaining_beats > 0:
        duration = random.choice(rhythm_values)
        if duration > remaining_beats:
            duration = remaining_beats

        etude.append((current_note, duration))
        remaining_beats -= duration

        if selected_rhythms and not selected_keys:
            continue

        if use_intervals:
            step = random.choice([-2, -1, 1, 2])
        else:
            step = random.choice([-1, 1])

        idx = scale.index(current_note)
        next_idx = (idx + step) % len(scale)
        current_note = scale[next_idx]

    return {
        "key": key,
        "etude": etude
    }
