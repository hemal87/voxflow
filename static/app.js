const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");

const userText = document.getElementById("userText");
const assistantText = document.getElementById("assistantText");

let microphoneStream = null;
let recognition = null;

let currentRequestId = 0;
let currentController = null;

let isSpeaking = false;
let shouldRecognize = false;


// =====================================
// VAD
// =====================================

let audioContext = null;
let analyser = null;
let micSource = null;
let vadRunning = false;

let lastVoiceTime = 0;
let pendingTranscript = "";

const SILENCE_TIME = 1200;
const VOICE_THRESHOLD = 0.04;


// =====================================
// SPEECH RECOGNITION
// =====================================

if ("webkitSpeechRecognition" in window) {

    recognition = new webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

} else {

    alert(
        "Speech recognition is not supported."
    );
}


// =====================================
// START RECOGNITION
// =====================================

function startRecognition() {

    if (!recognition || isSpeaking) {
        return;
    }

    try {

        recognition.start();

        console.log(
            "Recognition started"
        );

    } catch (error) {

        // Already running
    }
}


// =====================================
// STOP RECOGNITION
// =====================================

function stopRecognition() {

    if (!recognition) {
        return;
    }

    try {

        recognition.stop();

        console.log(
            "Recognition stopped"
        );

    } catch (error) {}
}


// =====================================
// CANCEL OLD REQUEST
// =====================================

function cancelCurrentRequest() {

    if (currentController) {

        console.log(
            "🛑 Cancelling old LLM request"
        );

        currentController.abort();

        currentController = null;
    }
}


// =====================================
// SEND FINAL USER MESSAGE
// =====================================

function finalizeUserSpeech() {

    if (isSpeaking) {
        return;
    }

    const message =
        pendingTranscript.trim();


    if (message === "") {
        return;
    }


    // Clear buffer BEFORE sending

    pendingTranscript = "";


    console.log(
        "👤 Final user message:",
        message
    );


    const requestId =
        ++currentRequestId;


    sendToVoxFlow(
        message,
        requestId
    );
}


// =====================================
// TEXT TO SPEECH
// =====================================

function speakAnswer(
    text,
    requestId
) {

    if (
        requestId !==
        currentRequestId
    ) {
        return;
    }


    stopRecognition();

    isSpeaking = true;

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;


    utterance.onstart = () => {

        if (
            requestId ===
            currentRequestId
        ) {

            isSpeaking = true;

            status.innerText =
                "🔊 VoxFlow is speaking...";
        }
    };


    utterance.onend = () => {

        isSpeaking = false;

        pendingTranscript = "";


        if (
            requestId ===
            currentRequestId
        ) {

            status.innerText =
                "🎤 Listening...";

            startRecognition();
        }
    };


    utterance.onerror = () => {

        isSpeaking = false;

        status.innerText =
            "🎤 Listening...";

        startRecognition();
    };


    window.speechSynthesis.speak(
        utterance
    );
}


// =====================================
// BARGE-IN
// =====================================

function interruptVoxFlow() {

    if (!isSpeaking) {
        return;
    }


    console.log(
        "🛑 BARGE-IN DETECTED"
    );


    // Stop speech immediately

    window.speechSynthesis.cancel();


    // Cancel old backend request
    // if it is still running

    cancelCurrentRequest();


    // Invalidate old response

    currentRequestId++;


    isSpeaking = false;


    status.innerText =
        "🎤 Interrupted — Listening...";


    // Small delay so browser
    // recognition can restart cleanly

    setTimeout(() => {

        startRecognition();

    }, 100);
}


// =====================================
// START VAD
// =====================================

async function startVoiceDetection() {

    if (!microphoneStream) {
        return;
    }


    audioContext =
        new AudioContext();


    micSource =
        audioContext
            .createMediaStreamSource(
                microphoneStream
            );


    analyser =
        audioContext.createAnalyser();


    analyser.fftSize = 2048;


    micSource.connect(
        analyser
    );


    vadRunning = true;


    console.log(
        "🎧 Voice detection started"
    );


    detectVoice();
}


// =====================================
// VAD LOOP
// =====================================

function detectVoice() {

    if (!vadRunning) {
        return;
    }


    const data =
        new Uint8Array(
            analyser.fftSize
        );


    analyser.getByteTimeDomainData(
        data
    );


    let sum = 0;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const value =
            (data[i] - 128) / 128;

        sum +=
            value * value;
    }


    const rms =
        Math.sqrt(
            sum / data.length
        );


    const now =
        performance.now();


    // =================================
    // ASSISTANT IS SPEAKING
    // =================================

    if (isSpeaking) {

        if (rms > VOICE_THRESHOLD) {

            if (
                !window.__voiceStartTime
            ) {

                window.__voiceStartTime =
                    now;
            }


            const duration =
                now -
                window.__voiceStartTime;


            if (duration >= 250) {

                interruptVoxFlow();

                window.__voiceStartTime =
                    null;
            }

        } else {

            window.__voiceStartTime =
                null;
        }


    // =================================
    // USER IS SPEAKING
    // =================================

    } else {

        if (rms > VOICE_THRESHOLD) {

            lastVoiceTime = now;
        }


        // ---------------------------------
        // TRAILING-OFF DETECTION
        // ---------------------------------

        if (
            pendingTranscript.trim() !== "" &&
            lastVoiceTime > 0 &&
            now - lastVoiceTime >= SILENCE_TIME
        ) {

            console.log(
                "🤫 Silence detected — finalizing speech"
            );


            lastVoiceTime = 0;


            finalizeUserSpeech();
        }
    }


    requestAnimationFrame(
        detectVoice
    );
}


// =====================================
// SEND TO VOXFLOW
// =====================================

async function sendToVoxFlow(
    message,
    requestId
) {

    const controller =
        new AbortController();


    currentController =
        controller;


    try {

        status.innerText =
            "🤔 Thinking...";


        const response =
            await fetch(
                "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    }),

                    signal:
                        controller.signal
                }
            );


        const data =
            await response.json();


        if (
            requestId !==
            currentRequestId
        ) {

            console.log(
                "⏭️ Old response ignored"
            );

            return;
        }


        currentController = null;


        assistantText.innerText =
            data.reply;


        speakAnswer(
            data.reply,
            requestId
        );


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            console.log(
                "✅ Old request aborted"
            );

            return;
        }


        console.error(
            "LLM error:",
            error
        );


        if (
            requestId ===
            currentRequestId
        ) {

            status.innerText =
                "❌ LLM error";

            isSpeaking = false;

            startRecognition();
        }
    }
}


// =====================================
// START BUTTON
// =====================================

startBtn.addEventListener(
    "click",
    async () => {

        try {

            window.speechSynthesis.cancel();


            microphoneStream =
                await navigator
                    .mediaDevices
                    .getUserMedia({

                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });


            console.log(
                "🎤 Microphone working!"
            );


            shouldRecognize = true;


            status.innerText =
                "🎤 Listening...";


            await startVoiceDetection();


            startRecognition();


        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );


            status.innerText =
                "❌ Microphone Permission Denied";
        }
    }
);


// =====================================
// RECOGNITION EVENTS
// =====================================

if (recognition) {


    recognition.onstart = () => {

        console.log(
            "Speech recognition started"
        );


        if (!isSpeaking) {

            status.innerText =
                "🎤 Listening...";
        }
    };


    recognition.onresult = (event) => {

        if (isSpeaking) {
            return;
        }


        let displayText =
            pendingTranscript;


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0]
                    .transcript
                    .trim();


            if (transcript === "") {
                continue;
            }


            if (
                event.results[i]
                    .isFinal
            ) {

                if (
                    pendingTranscript === ""
                ) {

                    pendingTranscript =
                        transcript;

                } else {

                    pendingTranscript +=
                        " " + transcript;
                }

            } else {

                displayText =
                    pendingTranscript +
                    " " +
                    transcript;
            }
        }


        userText.innerText =
            displayText.trim();


        // Voice recognition produced
        // something, so wait for silence.

        lastVoiceTime =
            performance.now();


        console.log(
            "📝 Current speech:",
            displayText.trim()
        );
    };


    recognition.onend = () => {

        console.log(
            "Speech recognition ended"
        );


        if (
            shouldRecognize &&
            !isSpeaking
        ) {

            setTimeout(
                () => {
                    startRecognition();
                },
                100
            );
        }
    };


    recognition.onerror = (event) => {

        console.log(
            "Speech recognition error:",
            event.error
        );


        // no-speech is normal

        if (
            event.error ===
            "no-speech"
        ) {
            return;
        }
    };
}