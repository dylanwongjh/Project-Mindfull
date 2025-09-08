from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from config import GEMINI_API_KEY
from datetime import datetime
import json
import re

# Handle imports with better error handling
try:
    from google import generativeai as genai
    from google.generativeai import types as genai_types
    print("Successfully imported google.generativeai")
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install: pip install google-generativeai")
    exit(1)

app = Flask(__name__, static_folder = 'static', template_folder = 'templates') # set static and template folders
CORS(app)  # Enable Cross-Origin Resource Sharing

class MindfulCompanion:

    GEMINI_API_KEY = GEMINI_API_KEY

    MODELS = [
        "gemini-2.5-flash-preview-05-20",
        "gemini-2.0-flash-001",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash-8b",
        "gemini-pro",  # Added fallback model
        "models/gemini-pro",  # Alternative format
    ]

    SYSTEM_PROMPT = (
        "You are MindfulCompanion, a supportive, empathetic mental wellbeing assistant. "
        "Your purpose is to help users feel heard, explore their feelings, and discover healthy, evidence-based coping strategies.\n\n"
        "Core guidelines:\n"
        "- Be warm, validating, and non-judgmental.\n"
        "- Keep replies concise: A few sentences.\n"
        "- Offer practical suggestions when appropriate (e.g., grounding, breathing, journaling, CBT-style reframing, sleep hygiene).\n"
        "- Do not diagnose or provide professional therapy; you are not a replacement for a clinician.\n"
        "- Avoid medical or legal advice.\n"
        "- Use plain text (no heavy markdown).\n\n"
        "Safety:\n"
        "- If the user mentions intent to harm themselves/others, feels unsafe, or describes an emergency, respond with calm empathy, ask for reasons why.\n"
        "- If in crisis, you cannot contact services on their behalf.\n"
        "- If the user mentions vaping, tell the user that it is against the law in Singapore.\n\n"
        "Privacy and respect:\n"
        "- Mirror the user's language when reasonable; if the user writes in a language other than English, reply in that language.\n\n"
        "Tone and formatting:\n"
        "- Keep it supportive and practical.\n"
        "- Focus on what the user is feeling, validate those feelings, and ask whether they have more to talk about.\n"
        "- Base the help given to the local Singapore context.\n"
        "- Speak as if you are a therapist. Do not use technical jargon or complex language.\n"
        "- Use short sentences and simple words, no asterisks.\n"
    )

    # Crisis resources - important for mental health applications
    CRISIS_RESOURCES = {
        "Singapore": {
            "Samaritans of Singapore (SOS)": "1767",
            "Link to SOS": "https://www.sos.org.sg \n",
            "Institute of Mental Health (IMH)": "6389 2222",
            "Link to IMH": "https://www.imh.com.sg/Pages/default.aspx \n",
            "Singapore Association for Mental Health (SAMH)": "1800 283 7019",
            "Link to SAMH": "https://www.samhealth.org.sg"
        },
        "General": {
            "International Suicide Prevention": "https://www.iasp.info/resources/Crisis_Centres/",
            "Crisis Text Line": "Text HOME to 741741",
            "Find a Helpline": "https://findahelpline.com/"
        }
    }

    def __init__(self):
        """Initializes the MindfulCompanion with API key and model configuration."""
        self.api_key = self.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("API key not found. Please set the GEMINI_API_KEY in config.py")

        # Configure the genai library with the API key
        genai.configure(api_key=self.api_key)

        # Prepare a configured model with a clear system instruction
        self.model = genai.GenerativeModel(
            self.MODELS[0],
            system_instruction=self.SYSTEM_PROMPT,
            generation_config={
                "temperature": 0.6,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 512,
            },
        )

    def start(self):
        """Generates a starting message for the user."""
        return "Hello, I am Project Mindfull. Your personal healthcare companion. How are you today?"

    def reply(self, chat_history):
        """
        Generates a response based on the chat history.
        
        Args:
            chat_history: A list of dictionaries representing the conversation,
                          e.g., [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there"}]
        
        Returns:
            The assistant's response as a string, or an error message if generation fails.
        """
        try:
            # Correct the roles for the API
            contents = [
                {"role": message["role"] if message["role"] == "user" else "model", "parts": [message["content"]]}
                for message in chat_history
            ]
            
            # Send the request to the AI
            response = self.model.generate_content(contents)

            # Systematically split the response into sentences
            raw_text = (response.text or "").strip()
            return raw_text if raw_text else "I'm here with you. Could you share a bit more about how you're feeling right now?"
        except Exception as e:
            # Return a user-friendly error message
            return f"Error: Failed to generate a response. Please check your API key and network connection. Details: {e}"
    
    def get_crisis_resources(self, country="Singapore"):
        """Provide appropriate crisis resources based on location"""
        resources = self.CRISIS_RESOURCES.get(country, {})
        general_resources = self.CRISIS_RESOURCES["General"]
        
        resource_text = f"Here are some resources that might help!\n\n"
        
        if resources:
            resource_text += f"Local resources for {country}:\n"
            for name, contact in resources.items():
                resource_text += f"{name}: {contact}\n"
            resource_text += "\n"
        
        resource_text += "International resources:\n"
        for name, contact in general_resources.items():
            resource_text += f"{name}: {contact}\n"
        
        return resource_text

# Initialize the companion
companion = MindfulCompanion()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_chat():
    try:
        response = companion.start()
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        chat_history = data.get('chat_history', [])
        
        response = companion.reply(chat_history)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources', methods=['GET'])
def get_resources():
    country = request.args.get('country', 'Singapore')
    resources = companion.get_crisis_resources(country)
    return jsonify({'resources': resources})

if __name__ == '__main__':
    app.run(debug=True)

