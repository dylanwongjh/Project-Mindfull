# Project Mindfull 🧠💬

> **"Heart Full, Stomach Full"**

Project Mindfull is a responsive, empathetic web-based AI mental wellbeing assistant. Built using a Flask backend and an interactive HTML/CSS/JavaScript frontend, it integrates Google's Gemini API to offer a warm, non-judgmental space for users to explore their feelings, practice coping strategies, and access localized crisis assistance.

---

## 📌 Features

* **Empathetic AI Companion:** Powered by Google's `gemini-2.5-flash-preview` model, explicitly instructed to deliver concise, supportive, and therapeutic-style dialogue.
* **Immersive Welcome Animation:** A polished, modern entrance screen built with CSS keyframes to ease users into a calm mental space.
* **Localized Care (Singapore Context):** Specially tuned to provide context-aware help, include legal notices regarding local regulations (e.g., vaping warnings), and deliver direct contact channels for local help organizations.
* **Crisis Resource Panel:** A dedicated, easily toggled sidebar exposing essential helpline contacts for Singapore (SOS, IMH, SAMH) and international alternatives.
* **Smooth UX:** Features an automatic typing indicator, seamless bottom-scrolling for conversational flow, and complete mobile optimization.

---

## 🛠️ Tech Stack & Tools

* **Backend:** Python, Flask, Flask-CORS
* **Frontend:** HTML5, CSS3 (using CSS variables, flexbox, and media queries), Vanilla JavaScript (ES6)
* **AI Engine:** Google Generative AI SDK (`google-generativeai`)
* **API Model Core:** `gemini-2.5-flash-preview-05-20` (with fallback support to `gemini-2.0-flash` & `gemini-pro`)

---

## 📁 Repository Structure

```text
Project-Mindfull/
│
├── app.py              # Main Flask server, API route handlers, and AI logic
├── config.py           # Configuration file containing your GEMINI_API_KEY (Git-ignored)
├── README.md           # Documentation
│
├── templates/
│   └── index.html      # Main app page layout and welcome screen DOM
│
└── static/
    ├── style.css       # Layout styles, color tokens, and smooth entrance keyframes
    ├── script.js       # Asynchronous chat handlers, event loops, and UI state triggers
    ├── projectmindfull.png  # Application branding logo
    └── grid-background.png  # The foundational backdrop texture
