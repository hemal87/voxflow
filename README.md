# 🎙️ VoxFlow — A Voice You Can Interrupt

**VoxFlow** is an interruptible voice-based college assistant designed around one key idea:

> **The user should be able to interrupt the assistant at any time.**

VoxFlow combines voice activity detection, speech recognition, a local LLM, task handling, and text-to-speech into a browser-based voice assistant.

---

## ✨ Key Features

### 🛑 Barge-in / Interruption

While VoxFlow is speaking, the user can start talking.

VoxFlow detects the user's voice, immediately stops the current speech output, invalidates the previous response, and starts processing the new request.

### 🤫 Smart Silence Handling

VoxFlow does not require the user to speak one perfect sentence.

If the user pauses while speaking, VoxFlow waits briefly before finalizing the request.

Example: "Tell me about the college... and also the admission process."

### 🧠 Local AI

VoxFlow uses **Ollama** with the `llama3.2:1b` model.

The AI runs locally, so no external LLM API key is required.

### 🎓 College Knowledge

College information is stored in `data/college_data.json`.

The assistant uses this information when answering college-related questions.

### ⚙️ Task Engine

VoxFlow supports simple simulated college workflows such as:

- Checking admission application status
- Booking a counselling session
- Cancelling a counselling request

---

## 🏗️ Architecture

Microphone → Voice Activity Detection → Speech Recognition → User Request → Task Engine / Local LLM → Response → Text-to-Speech → Speaker

### Interruption Flow

Assistant is speaking → User starts speaking → VAD detects voice → BARGE-IN DETECTED → Stop speech playback → Invalidate previous request → Process new user request → Speak new response

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Speech Recognition:** Web Speech API
- **Voice Activity Detection:** Web Audio API
- **Text-to-Speech:** Browser Speech Synthesis API
- **Backend:** Python + FastAPI
- **LLM:** Ollama + Llama 3.2 1B
- **Data:** JSON
- **Server:** Uvicorn

---

## 📁 Project Structure

The project contains:

- `app.py` — FastAPI backend
- `requirements.txt` — Python dependencies
- `data/college_data.json` — demonstration college data
- `static/app.js` — voice interaction and VAD logic
- `static/style.css` — UI styling
- `templates/index.html` — application interface
- `README.md` — project documentation
- `.gitignore` — ignored files such as the virtual environment

---

## How to Run

### 1. Clone the repository

Run: `git clone https://github.com/hemal87/voxflow.git`

Then run: `cd voxflow`

### 2. Create a Python virtual environment

Run: `python -m venv venv`

### 3. Activate the virtual environment

On Windows run: `venv\Scripts\activate`

### 4. Install dependencies

Run: `pip install -r requirements.txt`

### 5. Install and run Ollama

Install Ollama and make sure it is running locally.

Pull the required model:

`ollama pull llama3.2:1b`

### 6. Start VoxFlow

Run: `uvicorn app:app --reload`

### 7. Open the application

Open `http://127.0.0.1:8000` in your browser.

Allow microphone access when requested.

---

## 🎤 Voice Interaction Examples

### Information Query

**User:** What is the annual tuition fee?

**VoxFlow:** The annual tuition fee is ₹85,000.

### Barge-in

VoxFlow starts answering a question.

While it is speaking, the user says:

**"Stop. I have another question. What departments does the college have?"**

VoxFlow stops the current speech and processes the new request.

### Smart Silence

**User:** "Tell me about the college..."

The user pauses briefly and continues:

**"...and also the admission process."**

VoxFlow waits briefly during the pause and then processes the complete request.

### Task Interaction

**User:** Book counselling.

**VoxFlow:** Sure. What day and time would you prefer for your counselling session?

**User:** Friday at 4 PM.

The counselling request is then simulated as completed.

---

## What Is Mocked?

This project uses **demonstration data and simulated college workflows**.

- College information is demonstration data stored in `data/college_data.json`.
- Admission application status is simulated.
- Counselling booking is simulated.
- Counselling booking is not connected to a real calendar.
- No real student records are used.
- No real college database is used.
- No real college systems are modified.
- The project runs locally using Ollama for AI responses.

---

## ⚠️ Limitations

- Speech recognition depends on browser support for the Web Speech API.
- College information is demonstration data.
- Task operations are simulated.
- The project does not connect to real college systems.
- A production version could use streaming LLM responses and a real database or calendar.
- Microphone permissions are required.

---

## 🔮 Future Improvements

- Streaming LLM responses
- More robust server-side cancellation
- Real college database integration
- Real calendar integration
- Improved multilingual speech recognition
- Authentication and user-specific task management
- More advanced voice activity detection

---

## 💡 Why VoxFlow?

Most voice assistants assume that the user waits until the assistant finishes speaking.

VoxFlow is designed around a more natural interaction:

> **The user can speak whenever they want.**

The core interaction is:

**Listen → Understand → Respond**

with interruption available while the assistant is speaking.

---

## 📌 Project Information

**Project:** VoxFlow — A Voice You Can Interrupt

**Problem:** 5 · A Voice You Can Interrupt

**Purpose:** Demonstration project for an interruptible voice-based college assistant.

---

## 🧪 Demo Data Notice

All college names, fees, contact details, admission information, application status, and counselling workflows in this project are for demonstration purposes only.

This project does not connect to a real college database, student record system, payment system, or calendar.