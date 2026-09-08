# 🎙 VoxFlow

## A Voice You Can Interrupt

VoxFlow is an interruptible voice-based college assistant designed around
a simple idea:

> **The user should be able to interrupt the assistant at any time.**

Unlike a traditional voice assistant that waits for its response to finish,
VoxFlow detects user speech while speaking, immediately stops its voice
output, invalidates the previous response, and switches back to listening.

---

## ✨ Key Features

### 🛑 Barge-in

The user can interrupt VoxFlow while it is speaking.

```text
VoxFlow speaking
       ↓
User starts speaking
       ↓
Voice Activity Detection
       ↓
BARGE-IN detected
       ↓
Stop current speech
       ↓
Cancel / invalidate old request
       ↓
Listen to new request

Smart Silence Handling

VoxFlow does not immediately submit incomplete speech.

It waits for a short period of silence before finalizing the user's request.

For example:
"Tell me about the college..."
        ↓
short pause
        ↓
"...and also the admission process."
        ↓
single request

🧠 Local AI

VoxFlow uses a locally running Ollama model instead of requiring a cloud
API key.

📚 College Knowledge

College-specific information is stored in:

data/college_data.json

This allows VoxFlow to answer questions using structured college data.

⚡ Task Engine

VoxFlow can perform simple college-related tasks such as:

Check admission application status
Start a counselling booking
Collect a preferred counselling slot
Cancel a counselling request

🏗 Architecture

                    ┌──────────────────┐
                    │   Browser Mic    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       STT        │
                    │ Speech-to-Text   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Task Router    │
                    └───────┬───┬──────┘
                            │   │
                  ┌─────────┘   └──────────┐
                  ▼                        ▼
          ┌──────────────┐        ┌──────────────┐
          │ College Data │        │  Task Engine │
          │    JSON      │        │   Actions    │
          └──────┬───────┘        └──────┬───────┘
                 │                       │
                 └──────────┬────────────┘
                            ▼
                    ┌──────────────────┐
                    │  Local Ollama   │
                    │       LLM       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       TTS        │
                    │ Voice Response   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Browser Speaker  │
                    └──────────────────┘


          ┌────────────────────────────────────┐
          │          BARGE-IN PATH             │
          │                                    │
          │ User voice → VAD → Stop TTS       │
          │              ↓                     │
          │      Invalidate old response       │
          │              ↓                     │
          │       Listen to new request        │
          └────────────────────────────────────┘

          🛠 Tech Stack
Component	Technology
Frontend	HTML, CSS, JavaScript
Speech Recognition	Web Speech API
Voice Activity Detection	Web Audio API
Text-to-Speech	Browser Speech Synthesis
Backend	Python + FastAPI
LLM	Ollama + Llama 3.2 1B
Data	JSON
Runtime	Local machine
📁 Project Structure
voxflow/
│
├── data/
│   └── college_data.json
│
├── static/
│   ├── app.js
│   └── style.css
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
└── README.md

🚀 Running VoxFlow
1. Create virtual environment
python -m venv venv
2. Activate it

Windows:

venv\Scripts\activate
3. Install dependencies
pip install -r requirements.txt
4. Start Ollama

Make sure Ollama is installed and the model is available:

ollama pull llama3.2:1b
5. Start the FastAPI server
uvicorn app:app --reload
6. Open VoxFlow

Open:

http://127.0.0.1:8000
🎯 Example Interaction
Information

User:

What is the annual tuition fee?

VoxFlow:

The annual tuition fee is ₹85,000.

Task

User:

Book counselling.

VoxFlow:

Sure. What day and time would you prefer?

User:

Friday at 4 PM.

VoxFlow:

Done. Your counselling request has been booked for Friday at 4 PM.

Barge-in

VoxFlow:

The admission process consists of several steps...

User:

Stop! I have another question.

VoxFlow immediately stops speaking.

The new request is then captured and processed.

💡 Why VoxFlow?

Normal voice assistants often behave like:

User → Assistant speaks completely → User speaks

VoxFlow changes this interaction model:

User → Assistant speaks
          ↑
          │
     User can interrupt
          │
          ↓
Assistant stops immediately

The interruption itself is treated as a first-class interaction rather
than an error.

🔮 Future Improvements
Streaming LLM generation
Streaming TTS
More robust microphone/speaker echo handling
Persistent appointment storage
Real college database integration
Authentication
Calendar integration
More advanced task workflows
👨‍💻 Project

VoxFlow — A Voice You Can Interrupt

Built as an interruptible voice task assistant demonstrating:

VAD + STT + LLM + Task Engine + TTS + Barge-in

## 🧪 What Is Mocked?

This project uses demonstration data and simulated college workflows.

- College information is stored in `data/college_data.json`.
- Admission application status is simulated.
- Counselling booking is simulated and is not connected to a real calendar.
- No real student records or college database are used.
- The project runs locally using Ollama for AI responses.