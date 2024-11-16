import db_handler.db_connection as db
from db_handler.get import get_categories


def create_note(title: str, content: str, category: str):
    # check if category exists
    categories = get_categories()
    if category not in [category[1] for category in categories]:
        category_id = 1 # default category id
    else:
        category_id = [category[0] for category in categories if category[1] == category][0] # this is bad
                                                                                            # should be a object/dict
    

    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO notes (title, content, category_id)
        VALUES (?, ?, ?)
    ''', (title, content, category_id))
    conn.commit()
    return cursor.lastrowid


