
// Save a new note
async function saveNote() {

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const message = document.getElementById("message");

    if (!title.trim() || !content.trim()) {
        message.innerText = "Please fill in both fields!";
        return;
    }

    try {
        const response = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content })
        });

        const result = await response.json();

        if (!response.ok) {
            message.innerText = result.error;
            return;
        }

        message.innerText = "Note saved successfully!";

        document.getElementById("title").value = "";
        document.getElementById("content").value = "";

        loadNotes();

    } catch (error) {
        message.innerText = "Error saving note!";
        console.error(error);
    }
}


// Load and display all notes
async function loadNotes() {

    try {
        const response = await fetch("/api/notes");
        const notes = await response.json();

        const notesList = document.getElementById("notesList");
        notesList.innerHTML = "";

        notes.forEach(note => {

            const card = document.createElement("div");
            card.className = "note-card";

            const heading = document.createElement("h3");
            heading.textContent = note.title;

            const paragraph = document.createElement("p");
            paragraph.textContent = note.content;

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => editNote(note);

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.background = "#dc3545";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = () => deleteNote(note.id);

            card.appendChild(heading);
            card.appendChild(paragraph);
            card.appendChild(editButton);
            card.appendChild(deleteButton);

            notesList.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading notes:", error);
    }
}


// Edit a note
async function editNote(note) {

    const newTitle = prompt("Edit note title:", note.title);

    if (newTitle === null) return;

    const newContent = prompt("Edit note content:", note.content);

    if (newContent === null) return;

    if (!newTitle.trim() || !newContent.trim()) {
        alert("Title and content cannot be empty!");
        return;
    }

    try {
        const response = await fetch(`/api/notes/${note.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,
                content: newContent
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error);
            return;
        }

        alert("Note updated successfully!");
        loadNotes();

    } catch (error) {
        alert("Unable to update note!");
        console.error(error);
    }
}


// Delete a note
async function deleteNote(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error);
            return;
        }

        alert("Note deleted successfully!");
        loadNotes();

    } catch (error) {
        alert("Unable to delete note!");
        console.error(error);
    }
}


// Load notes when page opens
loadNotes();
