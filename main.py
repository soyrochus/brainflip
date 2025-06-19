# Brainflip - A simple web-based game - Copyright (c) 2025 - licence: MIT

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def serve_game():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)