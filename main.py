from flask import Flask
from db_handler import get, create

app = Flask(__name__)

@app.route('/')
def hello_world():
    notes = get.get_categories()
    return str(notes)

@app.route('/create')
def create_note():
    create.create_note("note 2", "content sdfijn", "category is not real, should default")
    return "Note created"

@app.route('/notes')
def get_notes():
    notes = get.get_notes()
    return str(notes)
    
if __name__ == '__main__':
    app.run()