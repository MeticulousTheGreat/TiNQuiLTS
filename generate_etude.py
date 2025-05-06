# Etude Practice Tool (Backend MVP)
# Requires: music21, Flask, Flask-CORS

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from music21 import stream, note, meter, key, tempo, midi, scale
import random
import tempfile
import os

app = Flask(__name__)
CORS(app)

# ------------------------
# Helper Functions
# ------------------------

def generate_etude(settings):
    num_measures = settings.get('measures', 4)
    selected_keys = settings.get('keys', [])  # e.g., ['C', 'Bb']
    include_rhythm = settings.get('rhythm', False)
    include_jumps = settings.get('jumps', False)
    transposition = settings.get('transpose', 'C')  # Default concert C

    # Choose random key if provided
    chosen_key_str = random.choice(selected_keys) if selected_keys else 'C'
    chosen_key = key.Key(chosen_key_str)

    # Create scale object for note generation
    scale_obj = scale.MajorScale(chosen_key.tonic.name)

    s = stream.Stream()
    s.append(tempo.MetronomeMark(number=100))
    s.append(meter.TimeSignature('4/4'))
    s.append(chosen_key)

    notes_per_measure = 4 if not include_rhythm else 8  # If rhythm = True, use more flexible rhythm patterns
    total_notes = num_measures * notes_per_measure

    prev_idx = random.randint(0, 6)  # Start at a random degree in scale
    current_pitch = scale_obj.getPitches("C3", "C6")[prev_idx]

    for _ in range(total_notes):
        dur = 1.0  # default quarter note

        if include_rhythm:
            dur = random.choice([0.5, 1.0, 1.5])  # 8th, quarter, dotted quarter

        if selected_keys:
            if include_jumps:
                jump = random.choice([-3, -2, -1, 1, 2, 3])
            else:
                jump = random.choice([-1, 1])

            prev_idx += jump
            prev_idx = max(0, min(prev_idx, 6))
            pitches = scale_obj.getPitches("C3", "C6")
            current_pitch = pitches[prev_idx % len(pitches)]
        else:
            current_pitch = 'C4'  # Rhythm only mode

        n = note.Note(current_pitch)
        n.duration.quarterLength = dur
        s.append(n)

    return s, chosen_key_str

# ------------------------
# Routes
# ------------------------

@app.route('/generate', methods=['POST'])
def generate():
    settings = request.json
    etude, chosen_key = generate_etude(settings)

    # Save MusicXML and MIDI
    temp_dir = tempfile.mkdtemp()
    xml_path = os.path.join(temp_dir, 'etude.xml')
    midi_path = os.path.join(temp_dir, 'etude.mid')
    etude.write('musicxml', fp=xml_path)
    mf = midi.translate.music21ObjectToMidiFile(etude)
    mf.open(midi_path, 'wb')
    mf.write()
    mf.close()

    return jsonify({
        'musicxml': '/get_file/xml',
        'midi': '/get_file/midi',
        'key': chosen_key
    })

@app.route('/get_file/<filetype>', methods=['GET'])
def get_file(filetype):
    temp_dir = tempfile.gettempdir()
    if filetype == 'xml':
        return send_file(os.path.join(temp_dir, 'etude.xml'))
    elif filetype == 'midi':
        return send_file(os.path.join(temp_dir, 'etude.mid'))
    else:
        return 'Invalid file type', 400

# ------------------------
# Run Server
# ------------------------

if __name__ == '__main__':
    app.run(debug=True)
