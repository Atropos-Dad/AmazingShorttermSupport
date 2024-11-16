document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Add search logic here
    });

    // New section button
    const newSectionBtn = document.querySelector('.new-section-btn');
    newSectionBtn.addEventListener('click', () => {
        // Create modal for new section input
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Create New Section</h2>
                <form id="newSectionForm">
                    <div class="form-group">
                        <label for="sectionTitle">Section Title</label>
                        <input type="text" id="sectionTitle" required placeholder="Enter section title">
                    </div>
                    <div class="form-group">
                        <label for="sectionColor">Section Color</label>
                        <input type="color" id="sectionColor" value="#f5f5f5">
                    </div>
                    <div class="form-buttons">
                        <button type="submit" class="submit-btn">Create</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#newSectionForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('sectionTitle').value;
            const color = document.getElementById('sectionColor').value;
            const currentDate = new Date().toLocaleDateString();

            try {
                const response = await fetch('/api/sections', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        color,
                        lastVisited: currentDate
                    })
                });

                if (response.ok) {
                    // Add new section to the UI
                    addNewSection(title, currentDate, color);
                    modal.remove();
                } else {
                    throw new Error('Failed to create section');
                }
            } catch (error) {
                console.error('Error creating section:', error);
                alert('Failed to create section. Please try again.');
            }
        });

        // Handle cancel button
        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });

    const noteGroups = document.querySelectorAll('.note-groups li');
    noteGroups.forEach(group => {
        group.addEventListener('click', () => {
            // Add navigation logic here
        });
    });

  
    function addNewSection(title, lastVisited, color) {
        const sectionGrid = document.querySelector('.section-grid');
        const newSection = document.createElement('div');
        newSection.className = 'section-card';
        newSection.style.backgroundColor = color;
        newSection.innerHTML = `
            <h3>${title}</h3>
            <p>Last visited: ${lastVisited}</p>
            <div class="section-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add click handlers for edit and delete
        const editBtn = newSection.querySelector('.edit-btn');
        const deleteBtn = newSection.querySelector('.delete-btn');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Add edit functionality here
        });

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this section?')) {
                try {
                    // Add API call to delete section
                    newSection.remove();
                } catch (error) {
                    console.error('Error deleting section:', error);
                }
            }
        });

        sectionGrid.prepend(newSection);
    }

    function addNewReminder(title, datetime) {
        const reminderList = document.querySelector('.reminder-list');
        const newReminder = document.createElement('div');
        newReminder.className = 'reminder-item';
        newReminder.innerHTML = `
            <i class="fas fa-bell"></i>
            <div class="reminder-content">
                <h4>${title}</h4>
                <p>${datetime}</p>
            </div>
        `;
        reminderList.prepend(newReminder);
    }

    const recordBtn = document.querySelector('.record-btn');
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];

    recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    // Here you can handle the recorded audio
                    // For example, send it to your server or process it
                    audioChunks = [];
                };

                mediaRecorder.start();
                isRecording = true;
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Unable to access microphone. Please check your permissions.');
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Note';
        }
    });

    // Add slider functionality
    const slider = document.querySelector('.section-slider');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const cardWidth = 200; // Width of card + margin

    leftArrow.addEventListener('click', () => {
        slider.scrollLeft -= cardWidth;
    });

    rightArrow.addEventListener('click', () => {
        slider.scrollLeft += cardWidth;
    });

    // Function to check if arrows should be visible
    function updateArrowVisibility() {
        leftArrow.style.opacity = slider.scrollLeft <= 0 ? '0.5' : '1';
        rightArrow.style.opacity = 
            slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth) 
            ? '0.5' 
            : '1';
    }

    slider.addEventListener('scroll', updateArrowVisibility);
    updateArrowVisibility(); // Initial check
});
