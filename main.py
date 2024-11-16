from flask import Flask
from db_handler import get, create
from ai_categorize.prompt_the_ai import categorize
from os import getenv

openrouter_key = getenv("OPENROUTER_KEY")
if not openrouter_key:
    raise ValueError("OPENROUTER_KEY environment variable is not set")


app = Flask(__name__)

@app.route('/get_categories')
def get_categories():
    notes = get.get_categories()
    return str(notes)

@app.route('/create_note/<content>')
def create_note(content):
    result = categorize(content)
    create.create_note(result['title'], content, result['category'], result['urgency'])
    return "Note created"

@app.route('/create_category/<category>')
def create_category(category):
    create.create_category(category)
    return "Category created"

@app.route('/get_note_by_id/<note_id>')
def get_note_by_id(note_id):
    note = get.get_note_by_id(note_id)
    return note

@app.route('/get_notes')
def get_notes():
    notes = get.get_notes()
    return notes
    
if __name__ == '__main__':
    app.run()