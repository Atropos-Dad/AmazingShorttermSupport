from flask import Flask, render_template, jsonify, request
from db_handler import get, create, modify
from ai_categorize.prompt_the_ai import categorize
from os import getenv
import json
import os
from litellm import transcription

openrouter_key = getenv("OPENROUTER_KEY")
if not openrouter_key:
    raise ValueError("OPENROUTER_KEY environment variable is not set")

app = Flask(__name__, static_folder='static', template_folder='templates')


@app.route('/')
def home():
    return render_template('homepage.html')


@app.route('/group/<category>')
def group_page(category):
    notes = get.get_notes_by_category(category)
    return render_template('group.html', group_name=category, notes=notes)


@app.route('/get_categories')
def get_categories():
    categories = get.get_categories()
    print("Categories returned:", json.dumps(categories))  # Debug log
    return app.response_class(
        response=json.dumps(categories),
        status=200,
        mimetype='application/json'
    )


@app.route('/create_note/<content>')
def create_note(content):
    result = categorize(content)
    create.create_note(result['title'], content,
                       result['category'], result['urgency'])
    return jsonify({"message": "Note created", "result": result})


@app.route('/create_category/<category>')
def create_category(category):
    create.create_category(category)
    return jsonify({"message": "Category created"})


@app.route('/get_note_by_id/<note_id>')
def get_note_by_id(note_id):
    note = get.get_note_by_id(note_id)
    return jsonify(note)


@app.route('/get_notes')
def get_notes():
    notes = get.get_notes()
    print("Notes returned:", json.dumps(notes))  # Debug log
    return app.response_class(
        response=json.dumps(notes),
        status=200,
        mimetype='application/json'
    )


@app.route('/delete_category/<category>')
def delete_category(category):
    success = modify.delete_category(category)
    if success:
        return jsonify({"message": "Category deleted"})
    return jsonify({"message": "Category not found"}), 404


@app.route('/update_note/<note_id>', methods=['POST'])
def update_note(note_id):
    data = request.json
    success = modify.update_note(
        int(note_id),
        data.get('title'),
        data.get('content'),
        data.get('urgency', 0)
    )
    if success:
        return jsonify({"message": "Note updated"})
    return jsonify({"message": "Note not found"}), 404


@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    # This is a placeholder endpoint for the speech-to-text functionality
    # You would implement actual speech-to-text processing here
    return jsonify({"text": "Sample transcribed text"})


@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio = request.files['audio_file']
    filename = 'uploaded_audio.webm'
    audio.save(filename)

    with open(filename, "rb") as file:
        response = transcription(
            file=(filename, file.read()),
            model="groq/distil-whisper-large-v3-en",
            response_format="verbose_json",
        )
        transcription_text = response.text

    os.remove(filename)
    create_note(transcription_text)
    return jsonify({'transcription': transcription_text})


@app.route('/get_high_urgency_notes')
def get_high_urgency_notes():
    notes = get.get_high_urgency_notes()
    return jsonify(notes)


@app.route('/delete_note/<int:note_id>', methods=['DELETE'])
def delete_note_route(note_id):
    success = modify.delete_note(note_id)
    if success:
        return jsonify({"message": "Note deleted"})
    return jsonify({"message": "Note not found"}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
