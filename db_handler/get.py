import db_handler.db_connection as db

def get_notes():
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM notes
    ''')
    return cursor.fetchall()

def get_note_by_id(note_id: int):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM notes WHERE id = ?
    ''', (note_id,))
    return cursor.fetchone()

def get_categories():
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM category
    ''')
    return cursor.fetchall()

def get_notes_by_category(category: str):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM notes WHERE category_id = ?
    ''', (category,))
    return cursor.fetchall()