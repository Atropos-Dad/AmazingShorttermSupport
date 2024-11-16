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
        // Add new section creation logic here
    });


    const noteGroups = document.querySelectorAll('.note-groups li');
    noteGroups.forEach(group => {
        group.addEventListener('click', () => {
            // Add navigation logic here
        });
    });

  
    function addNewSection(title, lastVisited) {
        const sectionGrid = document.querySelector('.section-grid');
        const newSection = document.createElement('div');
        newSection.className = 'section-card';
        newSection.innerHTML = `
            <h3>${title}</h3>
            <p>Last visited: ${lastVisited}</p>
        `;
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
