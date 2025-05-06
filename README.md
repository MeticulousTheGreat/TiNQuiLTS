# TiNQuiLTS
Randomized Sightreading Software


# Etude Practice Web App

This is a full-stack web application designed to help musicians practice custom-generated etudes. It combines a Flask backend for music generation with a React frontend for visualization and interaction.

## Features
- ✅ Generate randomized etudes based on user-selected keys, rhythms, and interval jumps
- ✅ Display sheet music in-browser using MusicXML
- ✅ Playback of correct etude using MIDI and Tone.js
- ✅ Adjustable tempo with real-time control
- ✅ Record-and-playback system (coming soon)

---

## 🔧 Project Structure

```
etude-practice/
├── backend/
│   ├── app.py              # Flask app
│   ├── generate_etude.py   # Music generation logic using music21
│   └── static/             # MIDI and MusicXML files
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React UI
│   │   └── ...             # Components
│   └── public/
├── README.md
└── requirements.txt
```

---

## 🛠️ Setup Instructions

### Backend (Flask)

#### 1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install dependencies:
```bash
pip install -r requirements.txt
```

#### 3. Run the backend:
```bash
python app.py
```
Backend will run at `http://localhost:5000`

### Frontend (React)

#### 1. Navigate to the frontend directory:
```bash
cd frontend
```

#### 2. Install dependencies:
```bash
npm install
```

#### 3. Start the development server:
```bash
npm run dev
```
Frontend will run at `http://localhost:5173`

> Make sure both frontend and backend are running simultaneously.

---

## ✨ Tech Stack
- **Python / Flask** — Backend API
- **music21** — Etude generation (notes + rhythms)
- **React** — Frontend UI
- **Tone.js** — MIDI playback
- **OpenSheetMusicDisplay** — Sheet music rendering
- **Tailwind + Shadcn/UI** — Component styling

---

## 🚧 Upcoming Features
- 🎙️ Audio recording with playback alongside correct version
- 🎯 Progress tracking & score annotation
- 📈 Practice logs & tempo tracking

---

## License
This project is provided under the MIT License.
