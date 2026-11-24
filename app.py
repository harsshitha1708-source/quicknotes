
from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)


# Connect to SQLite database
def get_db_connection():
    conn = sqlite3.connect("notes.db")
    conn.row_factory = sqlite3.Row
    return conn


# Create database table
def create_table():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Get all saved notes
@app.route("/api/notes", methods=["GET"])
def get_notes():

    conn = get_db_connection()

    notes = conn.execute(
        "SELECT * FROM notes ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([dict(note) for note in notes])


# Save a new note
@app.route("/api/notes", methods=["POST"])
def save_note():

    data = request.get_json()

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title or not content:
        return jsonify({"error": "Please fill in all fields"}), 400

    conn = get_db_connection()

    cursor = conn.execute(
        "INSERT INTO notes (title, content) VALUES (?, ?)",
        (title, content)
    )

    conn.commit()
    note_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Note saved successfully!",
        "id": note_id
    }), 201

# Edit an existing note
@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def edit_note(note_id):

    data = request.get_json()

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title or not content:
        return jsonify({"error": "Fill in all fields"}), 400

    conn = get_db_connection()

    cursor = conn.execute(
        "UPDATE notes SET title = ?, content = ? WHERE id = ?",
        (title, content, note_id)
    )

    conn.commit()
    updated = cursor.rowcount
    conn.close()

    if updated == 0:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"message": "Note updated successfully!"})


# Delete a note
@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):

    conn = get_db_connection()

    cursor = conn.execute(
        "DELETE FROM notes WHERE id = ?",
        (note_id,)
    )

    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Note not found"}), 404

    return jsonify({"message": "Note deleted successfully!"})



# Run the application
if __name__ == "__main__":

    create_table()

    app.run(debug=True)
