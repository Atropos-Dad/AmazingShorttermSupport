import db_handler.db_connection as db
from db_handler.get import get_categories


def create_note(title: str, content: str, category: str, urgency: int = 0):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    
    # Get category_id
    cursor.execute('''
        SELECT id FROM category WHERE title = ?
    ''', (category,))
    result = cursor.fetchone()
    category_id = result[0] if result else None

    # If category doesn't exist, create it
    if category_id is None:
        category_id = create_category(category)

    cursor.execute('''
        INSERT INTO notes (title, content, category_id, urgency)
        VALUES (?, ?, ?, ?)
    ''', (title, content, category_id, urgency))
    conn.commit()
    return cursor.lastrowid


def create_category(category: str):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO category (title)
        VALUES (?)
    ''', (category,))
    conn.commit()
    return cursor.lastrowid
