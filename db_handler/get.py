import db_handler.db_connection as db

def get_notes():
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT n.id, n.title, n.content, c.title as category, n.urgency 
        FROM notes n
        LEFT JOIN category c ON n.category_id = c.id
    ''')
    rows = cursor.fetchall()
    # Convert rows to list of dictionaries with proper JSON formatting
    return [{
        'id': row[0],
        'title': str(row[1]),
        'content': str(row[2]),
        'category': str(row[3]),
        'urgency': int(row[4])
    } for row in rows]

def get_note_by_id(note_id: int):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT n.id, n.title, n.content, c.title as category, n.urgency 
        FROM notes n
        LEFT JOIN category c ON n.category_id = c.id
        WHERE n.id = ?
    ''', (note_id,))
    row = cursor.fetchone()
    if row:
        return {
            'id': row[0],
            'title': str(row[1]),
            'content': str(row[2]),
            'category': str(row[3]),
            'urgency': int(row[4])
        }
    return None

def get_categories():
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DISTINCT title FROM category
    ''')
    rows = cursor.fetchall()
    # Convert rows to list of strings with proper JSON formatting
    return [str(row[0]) for row in rows]

def get_notes_by_category(category: str):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT n.id, n.title, n.content, c.title as category, n.urgency 
        FROM notes n
        LEFT JOIN category c ON n.category_id = c.id
        WHERE c.title = ?
    ''', (category,))
    rows = cursor.fetchall()
    # Convert rows to list of dictionaries with proper JSON formatting
    return [{
        'id': row[0],
        'title': str(row[1]),
        'content': str(row[2]),
        'category': str(row[3]),
        'urgency': int(row[4])
    } for row in rows]

def get_urgency(note_id: int):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT urgency FROM notes WHERE id = ?
    ''', (note_id,))
    row = cursor.fetchone()
    if row:
        return int(row[0])
    return None
