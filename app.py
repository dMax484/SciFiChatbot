# app.py
import openai
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify

load_dotenv()

app = Flask(__name__)
openai.api_key = os.environ["OPENAI_API_KEY"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    character = request.form["character"]
    character_info = request.form["character_info"]
    chat_history = request.form["chat_history"]
    chat_history = json.loads(chat_history)
    character_info = json.loads(character_info)
    
    # Your function to generate a response from OpenAI API
    character_response = generate_response(character, character_info, chat_history)
    
    return jsonify({"response": character_response})

def generate_response(character, character_info, chat_history):
    # Prepare the prompt for the OpenAI API
    prompt = f"User is having a conversation with {character}. {character} is from the novel {character_info['book']}.\nHere is some info about the character: {character_info['description']}\nThe character should respond in a manner consistent with their personality and background. Respond using only the tone, manner and vocabulary of the given character.\n\n"

    for message in chat_history:
        prompt += f"{message['role']}: {message['message']}\n"

    prompt += f"{character}: "

    # Call the OpenAI API
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.8,
        top_p=1
    )

    # Extract the generated text from the response
    character_response = response.choices[0].text.strip()

    # Save the user message and character response to a file
    with open("static/data/conversation_history.txt", "a") as f:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"Time: {timestamp}\n")
        last_user_message = chat_history[-1]['message']
        f.write(f"User: {last_user_message}\n")
        f.write(f"{character}: {character_response}\n")
        f.write(os.linesep)  # Add a line separator to distinguish conversations

    return character_response

if __name__ == "__main__":
    app.run(debug=True)
