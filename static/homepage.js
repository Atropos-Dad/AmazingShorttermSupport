document.addEventListener('DOMContentLoaded', () => {
    // Theme handling code remains the same
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme === 'dark');
    }

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

    // New functions for data fetching and UI updates
    async function fetchCategories() {
        try {
            const response = await fetch('/get_categories');
            if (response.status === 404) {
                console.warn('Categories endpoint not found');
                return [];
            }
            if (!response.ok) throw new Error('Failed to fetch categories');
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    async function fetchNotes() {
        try {
            const response = await fetch('/get_notes');
            if (response.status === 404) {
                console.warn('Notes endpoint not found');
                return [];
            }
            if (!response.ok) throw new Error('Failed to fetch notes');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notes:', error);
            return [];
        }
    }

    async function refreshUI() {
        const [categories, notes] = await Promise.all([
            fetchCategories(),
            fetchNotes()
        ]);

        // Update groups in sidebar
        updateGroupsList(categories);

        // Update recent sections
        updateRecentSections(notes, categories);
    }

    function updateGroupsList(categories) {
        const groupsList = document.querySelector('.note-groups ul');
        // Create new group button if it doesn't exist
        let newGroupButton = groupsList.querySelector('li:last-child');
        if (!newGroupButton || !newGroupButton.querySelector('.fa-plus')) {
            newGroupButton = document.createElement('li');
            newGroupButton.innerHTML = '<i class="fas fa-plus"></i> New Group';
            groupsList.appendChild(newGroupButton);
        }
        
        // Remove all existing groups
        Array.from(groupsList.children).forEach(child => {
            if (!child.querySelector('.fa-plus')) {
                child.remove();
            }
        });

        // Add fetched categories
        categories.forEach(category => {
            const li = document.createElement('li');
            li.dataset.groupName = category;
            li.innerHTML = `
                <i class="fas fa-book"></i>
                ${category}
            `;
            groupsList.insertBefore(li, newGroupButton);
        });

        // Reattach new group button click handler
        newGroupButton.addEventListener('click', showNewGroupModal);
    }

    function updateRecentSections(notes, categories) {
        const sectionGrid = document.querySelector('.section-grid');
        sectionGrid.innerHTML = ''; // Clear existing sections

        // Create section cards for each category
        categories.forEach(category => {
            const categoryNotes = notes.filter(note => note.category === category);
            const noteCount = categoryNotes.length;
            
            const newSection = document.createElement('div');
            newSection.className = 'section-card';
            newSection.dataset.groupName = category;
            newSection.innerHTML = `
                <h3>${category}</h3>
                <p>${noteCount} note${noteCount !== 1 ? 's' : ''}</p>
                <div class="section-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Add delete functionality
            const deleteBtn = newSection.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this group?')) {
                    try {
                        const response = await fetch(`/delete_category/${encodeURIComponent(category)}`);
                        if (!response.ok) throw new Error('Failed to delete category');
                        await refreshUI(); // Refresh the UI after successful deletion
                    } catch (error) {
                        console.error('Error deleting category:', error);
                        alert('Failed to delete category. Please try again.');
                    }
                }
            });

            sectionGrid.appendChild(newSection);
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const groups = document.querySelectorAll('.note-groups li:not(:last-child)');
        const sections = document.querySelectorAll('.section-card');

        groups.forEach(group => {
            const groupName = group.textContent.trim().toLowerCase();
            group.style.display = groupName.includes(searchTerm) ? '' : 'none';
        });

        sections.forEach(section => {
            const sectionName = section.querySelector('h3').textContent.toLowerCase();
            section.style.display = sectionName.includes(searchTerm) ? '' : 'none';
        });
    });

    // New Group Modal functionality
    function showNewGroupModal() {
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
                    <div class="modal-actions">
                        <button type="button" class="modal-btn secondary" id="cancelBtn">Cancel</button>
                        <button type="submit" class="modal-btn primary">Create Group</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Form submission handler
        const form = modal.querySelector('#newGroupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupName = document.getElementById('groupName').value;

            if (groupName) {
                try {
                    const response = await fetch(`/create_category/${encodeURIComponent(groupName)}`);
                    if (!response.ok) throw new Error('Failed to create category');
                    await refreshUI(); // Refresh UI after successful creation
                    modal.remove();
                } catch (error) {
                    console.error('Error creating category:', error);
                    alert('Failed to create category. Please try again.');
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

    // Event delegation for groups
    const groupsList = document.querySelector('.note-groups ul');
    groupsList.addEventListener('click', (event) => {
        const target = event.target.closest('li');
        if (target && !target.querySelector('.fa-plus')) {
            const groupName = target.dataset.groupName;
            window.location.href = `/group/${encodeURIComponent(groupName)}`;
        }
    });

    // Event delegation for section cards
    const sectionGrid = document.querySelector('.section-grid');
    sectionGrid.addEventListener('click', (event) => {
        const sectionCard = event.target.closest('.section-card');
        if (sectionCard && !event.target.closest('.delete-btn')) {
            const sectionTitle = sectionCard.dataset.groupName;
            window.location.href = `/group/${encodeURIComponent(sectionTitle)}`;
        }
    });

    // Initial data load
    refreshUI();

    // Refresh data periodically (every 30 seconds)
    setInterval(refreshUI, 30000);
});
