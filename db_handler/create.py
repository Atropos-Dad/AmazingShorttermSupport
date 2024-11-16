import db_handler.db_connection as db
from db_handler.get import get_categories


def create_note(title: str, content: str, category: str, urgency: int = 0):
    # check if category exists
    categories = get_categories()
    category_id = None
    for cat in categories:
        if cat[1] == category:
            category_id = cat[0]
            break

    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
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