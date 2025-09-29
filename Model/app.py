
# Step 3: Start the Ollama server and pull the reliable Mistral model
import os
import time
os.system('nohup ollama serve &')
time.sleep(10) # Wait 10 seconds to ensure the server is fully ready
os.system('ollama pull mistral')

# Step 4: Set up your ngrok authentication token
NGROK_AUTHTOKEN = "336mFUv6w3AKHGRoCESusyXrOCZ_2vf9SmPFGerw4uZhmx2Sa" # Replace with your actual token

# Step 5: Create and configure the Flask web server app
from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama
from pyngrok import ngrok

app = Flask(__name__)
CORS(app) # Apply CORS to all routes

@app.route('/', methods=['GET', 'OPTIONS'])
def root():
    """Handles requests to the base URL to prevent 404 errors."""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    return "AI Diagram Generation Server is running."

@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate():
    """Handles the diagram generation requests."""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    if request.method == 'POST':
        try:
            data = request.get_json()
            user_prompt = data.get('prompt')

            system_instruction = "You are a Mermaid flowchart code generator. You must only output the raw Mermaid code and nothing else. Start the flowchart with 'graph TD'."

            response = ollama.chat(
                model='mistral',
                messages=[
                    {'role': 'system', 'content': system_instruction},
                    {'role': 'user', 'content': f"Create a flowchart for: {user_prompt}"}
                ]
            )

            mermaid_code = response['message']['content']
            return jsonify({'mermaid_code': mermaid_code})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Step 6: Start the ngrok tunnel and run the Flask app
if __name__ == '__main__':
    ngrok.set_auth_token(NGROK_AUTHTOKEN)
    public_url = ngrok.connect(5000)
    print("--- ROBUST SERVER IS LIVE ---")
    print(f" * Public URL: {public_url}")
    print(" * Use this new URL in your index.html file.")
    app.run(port=5000)
