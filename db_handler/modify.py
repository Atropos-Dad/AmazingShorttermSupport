import db_handler.db_connection as db

def delete_category(category: str):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    
    # First get the category_id
    cursor.execute('''
        SELECT id FROM category WHERE title = ?
    ''', (category,))
    result = cursor.fetchone()
    
    if result:
        category_id = result[0]
        # Delete associated notes first (due to foreign key constraint)
        cursor.execute('''
            DELETE FROM notes WHERE category_id = ?
        ''', (category_id,))
        
        # Then delete the category
        cursor.execute('''
            DELETE FROM category WHERE id = ?
        ''', (category_id,))
        
        conn.commit()
        return True
    return False

def update_note(note_id: int, title: str, content: str, urgency: int = 0):
    conn = db.SingletonDBConnection().get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE notes 
        SET title = ?, content = ?, urgency = ?
        WHERE id = ?
    ''', (title, content, urgency, note_id))
    
    conn.commit()
    return cursor.rowcount > 0
