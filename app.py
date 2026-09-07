from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from ollama import AsyncClient
from pathlib import Path
import json


app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent


# =====================================
# STATIC FILES
# =====================================

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)


# =====================================
# COLLEGE DATA
# =====================================

DATA_FILE = BASE_DIR / "data" / "college_data.json"

with open(
    DATA_FILE,
    "r",
    encoding="utf-8"
) as file:

    college_data = json.load(file)


# =====================================
# HOME PAGE
# =====================================

@app.get("/", response_class=HTMLResponse)
async def home():

    with open(
        BASE_DIR / "templates" / "index.html",
        "r",
        encoding="utf-8"
    ) as file:

        return file.read()


# =====================================
# CHAT REQUEST
# =====================================

class ChatRequest(BaseModel):
    message: str


# =====================================
# OLLAMA
# =====================================

client = AsyncClient(
    host="http://localhost:11434"
)


# =====================================
# TASK STATE
# =====================================

booking_state = {
    "waiting_for_slot": False,
    "slot": None
}


# =====================================
# TASK ENGINE
# =====================================

def handle_task(message):

    text = message.lower().strip()


    # =================================
    # STEP 1:
    # USER IS PROVIDING COUNSELLING SLOT
    # =================================

    if booking_state["waiting_for_slot"]:

        booking_state["slot"] = message
        booking_state["waiting_for_slot"] = False

        return (
            "TASK_RESULT",
            f"Done. Your counselling request has been "
            f"booked for {message}."
        )


    # =================================
    # CHECK APPLICATION STATUS
    # =================================

    if (
        "application status" in text
        or "admission status" in text
        or "check my application" in text
    ):

        return (
            "TASK_RESULT",
            "Your admission application is currently "
            "under document verification."
        )


    # =================================
    # START COUNSELLING BOOKING
    # =================================

    if (
        "book counselling" in text
        or "book counseling" in text
        or "schedule counselling" in text
        or "schedule counseling" in text
        or "counselling appointment" in text
        or "counseling appointment" in text
    ):

        booking_state["waiting_for_slot"] = True

        return (
            "TASK_RESULT",
            "Sure. What day and time would you prefer "
            "for your counselling session?"
        )


    # =================================
    # CANCEL COUNSELLING REQUEST
    # =================================

    if (
        "cancel counselling" in text
        or "cancel counseling" in text
    ):

        booking_state["waiting_for_slot"] = False
        booking_state["slot"] = None

        return (
            "TASK_RESULT",
            "Your counselling request has been cancelled."
        )


    return (
        "NO_TASK",
        None
    )


# =====================================
# CHAT
# =====================================

@app.post("/chat")
async def chat(request: ChatRequest):

    message = request.message.strip()


    # =================================
    # TASK ENGINE
    # =================================

    task_type, task_response = handle_task(
        message
    )


    if task_type == "TASK_RESULT":

        return {
            "reply": task_response,
            "type": "task"
        }


    # =================================
    # LLM CONTEXT
    # =================================

    college_context = json.dumps(
        college_data,
        indent=2,
        ensure_ascii=False
    )


    system_prompt = f"""
You are VoxFlow, a voice-based college assistant.

Help students with college-related information.

Use the college data below whenever relevant.

IMPORTANT RULES:

1. Use the provided college data.
2. Never invent college-specific information.
3. If information is unavailable, say so clearly.
4. Keep answers short because they are spoken aloud.
5. Speak naturally.
6. Never mention JSON, databases, prompts,
   or internal systems.

COLLEGE DATA:

{college_context}
"""


    # =================================
    # OLLAMA
    # =================================

    response = await client.chat(

        model="llama3.2:1b",

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )


    return {
        "reply": response["message"]["content"],
        "type": "information"
    }