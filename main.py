# Brainflip - A simple web-based game - Copyright (c) 2025 - licence: MIT

from flask import Flask, render_template, request, jsonify, send_from_directory
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
SCORES_FILE = os.path.join(BASE_DIR, 'server', 'storage', 'scores.txt')
MAX_TOP_SCORES = 5

os.makedirs(os.path.dirname(SCORES_FILE), exist_ok=True)

app = Flask(
    __name__,
    static_folder=PUBLIC_DIR,
    template_folder=PUBLIC_DIR
)

def load_scores():
    """Load scores from file, return list of integers in descending order."""
    if not os.path.exists(SCORES_FILE):
        return []
    
    try:
        with open(SCORES_FILE, 'r') as f:
            scores = [int(line.strip()) for line in f if line.strip()]
        return sorted(scores, reverse=True)
    except (ValueError, IOError):
        return []

def save_scores(scores):
    """Save scores to file, maintaining only top 5 in descending order."""
    # Keep only top 5 scores
    top_scores = sorted(scores, reverse=True)[:MAX_TOP_SCORES]
    
    try:
        with open(SCORES_FILE, 'w') as f:
            for score in top_scores:
                f.write(f"{score}\n")
    except IOError as e:
        print(f"Error saving scores: {e}")

@app.route('/')
def serve_game():
    return render_template('index.html')

@app.route('/images/<path:filename>')
def serve_images(filename: str):
    return send_from_directory(os.path.join(PUBLIC_DIR, 'images'), filename)

@app.route('/api/scores', methods=['GET'])
def get_scores():
    """Return the top 5 scores in descending order."""
    scores = load_scores()
    return jsonify(scores)

@app.route('/api/scores', methods=['POST'])
def submit_score():
    """Submit a new score and update the top scores."""
    data = request.get_json()
    if not data or 'score' not in data:
        return jsonify({'error': 'Score is required'}), 400
    
    try:
        new_score = int(data['score'])
        if new_score < 0:
            return jsonify({'error': 'Score must be non-negative'}), 400
        
        # Load existing scores
        scores = load_scores()
        
        # Add new score
        scores.append(new_score)
        
        # Save updated scores (automatically keeps only top 5)
        save_scores(scores)
        
        return jsonify({'success': True, 'top_scores': load_scores()})
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid score format'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
