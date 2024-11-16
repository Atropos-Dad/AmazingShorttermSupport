document.addEventListener('DOMContentLoaded', async () => {
    // Initialize DOM elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    const searchInput = document.querySelector('.search-bar input');
    const groupsList = document.querySelector('.note-groups ul');
    const newGroupButton = document.querySelector('.note-groups li:last-child');
    const mainRecordBtn = document.querySelector('.main-record-btn');
    
    // Initialize state variables
    let groups = [];
    let notes = [];  // Store notes data
    let isMainRecording = false;
    let mainMediaRecorder;
    let mainAudioChunks = [];

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme === 'dark');
    }

    // Load initial data
    try {
        const [categoriesResponse, notesResponse] = await Promise.all([
            fetch('/get_categories'),
            fetch('/get_notes')
        ]);
        const categories = await categoriesResponse.json();
        notes = await notesResponse.json();  // Store notes data globally
        
        // Initialize groups with categories
        groups = categories.map(category => ({
            name: category,
            priority: 0,
            timestamp: Date.now()
        }));

        // Add categories to sidebar
        categories.forEach(category => {
            addNewGroup(category, 0, false);
        });

        // Add notes to sections
        notes.forEach(note => {
            addNewSection(note.id, note.title, note.content, note.urgency);
        });
    } catch (error) {
        console.error('Error loading initial data:', error);
    }

    // Theme toggle functionality
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'dark');
    });

    function updateThemeIcon(isDark) {
        const icon = darkModeToggle.querySelector('i');
        const text = darkModeToggle.querySelector('span');
        
        if (isDark) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Filter groups based on search term
        const filteredGroups = groups.filter(group => 
            group.name.toLowerCase().includes(searchTerm)
        );
        // Update UI with filtered groups
        updateGroupsUI(filteredGroups);
    });

    function updateGroupsUI(filteredGroups) {
        // Remove all groups except the "New Group" button
        const items = groupsList.querySelectorAll('li:not(:last-child)');
        items.forEach(item => item.remove());

        // Add filtered groups
        filteredGroups.forEach(group => {
            addNewGroup(group.name, group.priority, false);
        });
    }

    // New Group functionality
    newGroupButton.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Group</h2>
                </div>
                <form id="newGroupForm">
                    <div class="form-group">
                        <label for="groupName">Group Name</label>
                        <div class="input-with-audio">
                            <input 
                                type="text" 
                                id="groupName" 
                                required 
                                placeholder="Enter group name"
                            >
                            <button type="button" class="audio-btn" id="recordBtn">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                        <div id="audioFeedback" class="audio-feedback" style="display: none;">
                            <span class="recording-text">Recording...</span>
                            <div class="audio-wave"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="priorityLevel">Priority Level (0-4)</label>
                        <input 
                            type="number" 
                            id="priorityLevel" 
                            required 
                            min="0" 
                            max="4" 
                            placeholder="Enter priority level"
                        >
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="modal-btn secondary" id="cancelBtn">Cancel</button>
                        <button type="submit" class="modal-btn primary">Create Group</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Audio recording functionality
        const recordBtn = modal.querySelector('#recordBtn');
        const audioFeedback = modal.querySelector('#audioFeedback');
        const groupNameInput = modal.querySelector('#groupName');
        let mediaRecorder;
        let audioChunks = [];
        let isRecording = false;

        recordBtn.addEventListener('click', async () => {
            try {
                if (!isRecording) {
                    // Start recording
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        
                        // Convert speech to text
                        try {
                            const formData = new FormData();
                            formData.append('audio', audioBlob);
                            
                            const response = await fetch('/api/speech-to-text', {
                                method: 'POST',
                                body: formData
                            });
                            
                            const data = await response.json();
                            if (data.text) {
                                groupNameInput.value = data.text;
                            }
                        } catch (error) {
                            console.error('Speech to text error:', error);
                            alert('Failed to convert speech to text. Please try again.');
                        }

                        audioFeedback.style.display = 'none';
                        recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                        recordBtn.classList.remove('recording');
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    audioFeedback.style.display = 'flex';
                    recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
                    recordBtn.classList.add('recording');
                } else {
                    // Stop recording
                    mediaRecorder.stop();
                    isRecording = false;
                }
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Unable to access microphone. Please check your permissions.');
            }
        });

        // Form submission handler
        const form = modal.querySelector('#newGroupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupName = document.getElementById('groupName').value;
            const priority = parseInt(document.getElementById('priorityLevel').value);

            if (groupName && !isNaN(priority) && priority >= 0 && priority <= 4) {
                try {
                    // Create category in backend
                    const response = await fetch(`/create_category/${encodeURIComponent(groupName)}`);
                    const result = await response.json();
                    
                    if (result.message === "Category created") {
                        addNewGroup(groupName, priority, true);
                        if (priority >= 0) {
                            addNewSection(null, groupName, 'Just created', priority);
                        }
                        modal.remove();
                    } else {
                        alert('Failed to create category');
                    }
                } catch (error) {
                    console.error('Error creating category:', error);
                    alert('Failed to create category');
                }
            }
        });

        // Cancel button handler
        const cancelBtn = modal.querySelector('#cancelBtn');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });

    function addNewGroup(name, priority, addToArray = true) {
        const li = document.createElement('li');
        li.dataset.groupName = name;
        li.innerHTML = `
            <i class="fas fa-book"></i>
            ${name}
            ${priority === 4 ? '<span style="color: red">*</span>' : ''}
        `;

        // Add click handler to navigate to group page
        li.addEventListener('click', () => {
            if (!li.querySelector('.fa-plus')) {  // Don't navigate if it's the "New Group" button
                window.location.href = `/group/${encodeURIComponent(name)}`;
            }
        });

        // Insert before the "New Group" button
        groupsList.insertBefore(li, newGroupButton);

        // Add to groups array if needed
        if (addToArray) {
            groups.push({
                name: name,
                priority: priority,
                timestamp: Date.now()
            });
        }
    }

    function addNewSection(id, title, content, priority = 0) {
        const sectionGrid = document.querySelector('.section-grid');
        const newSection = document.createElement('div');
        newSection.className = 'section-card';
        newSection.dataset.groupName = title;
        newSection.dataset.noteId = id;  // Store note ID in the DOM
        newSection.innerHTML = `
            <h3>${title} ${priority === 4 ? '<span style="color: red">*</span>' : ''}</h3>
            <p>${content}</p>
            <div class="section-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add edit functionality
        const editBtn = newSection.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const noteId = newSection.dataset.noteId;
            if (noteId) {
                showEditModal(parseInt(noteId), title, content, priority);
            }
        });

        // Add delete functionality
        const deleteBtn = newSection.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            await deleteGroupAndSection(title);
        });

        sectionGrid.prepend(newSection);
    }

    function showEditModal(id, title, content, priority) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Note</h2>
                </div>
                <form id="editNoteForm">
                    <div class="form-group">
                        <label for="noteTitle">Title</label>
                        <input 
                            type="text" 
                            id="noteTitle" 
                            required 
                            value="${title}"
                            placeholder="Enter note title"
                        >
                    </div>
                    <div class="form-group">
                        <label for="noteContent">Content</label>
                        <textarea 
                            id="noteContent" 
                            required 
                            placeholder="Enter note content"
                        >${content}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="notePriority">Priority Level (0-4)</label>
                        <input 
                            type="number" 
                            id="notePriority" 
                            required 
                            min="0" 
                            max="4" 
                            value="${priority}"
                            placeholder="Enter priority level"
                        >
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="modal-btn secondary" id="cancelBtn">Cancel</button>
                        <button type="submit" class="modal-btn primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Form submission handler
        const form = modal.querySelector('#editNoteForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newTitle = document.getElementById('noteTitle').value;
            const newContent = document.getElementById('noteContent').value;
            const newPriority = parseInt(document.getElementById('notePriority').value);

            if (newTitle && newContent && !isNaN(newPriority) && newPriority >= 0 && newPriority <= 4) {
                try {
                    const response = await fetch(`/update_note/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: newTitle,
                            content: newContent,
                            urgency: newPriority
                        })
                    });
                    
                    const result = await response.json();
                    if (result.message === "Note updated") {
                        // Update the section in the UI
                        const section = document.querySelector(`.section-card[data-note-id="${id}"]`);
                        if (section) {
                            section.querySelector('h3').innerHTML = `${newTitle} ${newPriority === 4 ? '<span style="color: red">*</span>' : ''}`;
                            section.querySelector('p').textContent = newContent;
                            section.dataset.groupName = newTitle;
                        }
                        modal.remove();
                    } else {
                        alert('Failed to update note');
                    }
                } catch (error) {
                    console.error('Error updating note:', error);
                    alert('Failed to update note');
                }
            }
        });

        // Cancel button handler
        const cancelBtn = modal.querySelector('#cancelBtn');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Add this new function to handle deletion from both places
    async function deleteGroupAndSection(name) {
        if (confirm('Are you sure you want to delete this group?')) {
            try {
                const response = await fetch(`/delete_category/${encodeURIComponent(name)}`);
                const result = await response.json();
                
                if (result.message === "Category deleted") {
                    // Remove from sidebar
                    const sidebarItems = document.querySelectorAll('.note-groups li');
                    sidebarItems.forEach(item => {
                        if (!item.querySelector('.fa-plus') && item.dataset.groupName === name) {
                            item.remove();
                        }
                    });
                    
                    // Remove from Recent Sections
                    const sections = document.querySelectorAll('.section-card');
                    sections.forEach(section => {
                        if (section.dataset.groupName === name) {
                            section.remove();
                        }
                    });

                    // Remove from groups array
                    groups = groups.filter(group => group.name !== name);
                } else {
                    alert('Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category');
            }
        }
    }

    // Main record button functionality
    mainRecordBtn.addEventListener('click', async () => {
        if (!isMainRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mainMediaRecorder = new MediaRecorder(stream);
                mainAudioChunks = [];

                mainMediaRecorder.ondataavailable = (event) => {
                    mainAudioChunks.push(event.data);
                };

                mainMediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(mainAudioChunks, { type: 'audio/wav' });
                    
                    try {
                        const formData = new FormData();
                        formData.append('audio', audioBlob);
                        
                        // First convert speech to text
                        const speechResponse = await fetch('/api/speech-to-text', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const speechData = await speechResponse.json();
                        if (speechData.text) {
                            // Then create a note with the transcribed text
                            const noteResponse = await fetch(`/create_note/${encodeURIComponent(speechData.text)}`);
                            const noteData = await noteResponse.json();
                            
                            if (noteData.result) {
                                addNewSection(null, noteData.result.title, speechData.text, noteData.result.urgency);
                            }
                        }
                    } catch (error) {
                        console.error('Error processing voice note:', error);
                        alert('Failed to process voice note. Please try again.');
                    }

                    mainRecordBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Record Note</span>';
                    mainRecordBtn.classList.remove('recording');
                };

                mainMediaRecorder.start();
                isMainRecording = true;
                mainRecordBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop Recording</span>';
                mainRecordBtn.classList.add('recording');
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Unable to access microphone. Please check your permissions.');
            }
        } else {
            mainMediaRecorder.stop();
            isMainRecording = false;
        }
    });
});
