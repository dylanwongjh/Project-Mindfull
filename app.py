from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from google import generativeai
import os
import time

# Attempt to load API key from config.py first
# This is for local development
try:
    from config import GEMINI_API_KEY
    print("API key loaded from config.py")
except ImportError:
    # If config.py is not found, load from environment variables for production
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found. Please set it in config.py or as an environment variable.")
        exit(1)

app = Flask(__name__)
CORS(app)

# Configure the Generative AI client
try:
    generativeai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    exit(1)

@app.route('/')
def home():
    # In a typical setup, you would serve an index.html file here.
    # For a simple API, we'll just return a message.
    return "MindfulCompanion API is running!"

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handles chat requests from the frontend.
    """
    try:
        data = request.json
        chat_history = data.get('chat_history', [])
        user_message = data.get('user_message', '')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Create a new chat session with the model
        model = generativeai.GenerativeModel('gemini-2.5-flash-preview-05-20')
        chat_session = model.start_chat(history=chat_history)

        # Send the user message and get a response
        response = chat_session.send_message(user_message, stream=False)

        # Split the reply into sentences
        ai_reply = response.text
        sentences = [s.strip() for s in ai_reply.split('.') if s.strip()]

        return jsonify({'response': sentences})

    except Exception as e:
        print(f"Chat API error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # This block is for local development only
    app.run(debug=True, port=8080)

