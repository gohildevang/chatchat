// UI Helper Functions and Interactions

// Global UI state
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize theme
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeIcon = document.querySelector('.icon-btn[onclick="toggleTheme()"] i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Theme toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.icon-btn[onclick="toggleTheme()"] i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showNotification(`Switched to ${currentTheme} mode`, 'info');
}

// Logout function
function logout() {
    if (window.authManager) {
        window.authManager.logout();
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus first input if exists
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Clear form inputs
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.value = '';
            }
        });
    }
}

// Settings functions
function showSettings() {
    const user = window.authManager.getCurrentUser();
    if (user) {
        // Populate settings form
        document.getElementById('settings-username').value = user.username || '';
        document.getElementById('settings-bio').value = user.bio || '';
        
        const avatarElement = document.getElementById('settings-avatar');
        if (user.avatar) {
            avatarElement.src = `http://localhost:5000${user.avatar}`;
        } else {
            avatarElement.src = '';
            avatarElement.style.background = 'var(--gradient-secondary)';
            avatarElement.innerHTML = user.username.charAt(0).toUpperCase();
        }
        
        showModal('settings-modal');
    }
}

async function updateProfile() {
    const username = document.getElementById('settings-username').value.trim();
    const bio = document.getElementById('settings-bio').value.trim();
    
    if (!username) {
        showNotification('Username is required', 'error');
        return;
    }
    
    if (username.length < 3) {
        showNotification('Username must be at least 3 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${window.authManager.apiUrl}/users/profile`, {
            method: 'PUT',
            headers: {
                ...window.authManager.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, bio })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update stored user data
            const updatedUser = data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.authManager.user = updatedUser;
            
            // Update UI
            if (window.chatApp) {
                window.chatApp.updateUserProfile();
            }
            
            closeModal('settings-modal');
            showNotification('Profile updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function uploadAvatar() {
    const input = document.getElementById('avatar-input');
    if (input) {
        input.click();
    }
}

// Handle avatar file selection
document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select an image file', 'error');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Image size must be less than 5MB', 'error');
                    return;
                }
                
                try {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    const response = await fetch(`${window.authManager.apiUrl}/users/avatar`, {
                        method: 'POST',
                        headers: window.authManager.getAuthHeader(),
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        // Update stored user data
                        const updatedUser = data.user;
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        window.authManager.user = updatedUser;
                        
                        // Update avatar preview
                        const avatarElement = document.getElementById('settings-avatar');
                        avatarElement.src = `http://localhost:5000${updatedUser.avatar}`;
                        
                        // Update UI
                        if (window.chatApp) {
                            window.chatApp.updateUserProfile();
                        }
                        
                        showNotification('Avatar updated successfully', 'success');
                    } else {
                        showNotification(data.message || 'Failed to upload avatar', 'error');
                    }
                } catch (error) {
                    console.error('Avatar upload error:', error);
                    showNotification('Network error. Please try again.', 'error');
                }
            }
        });
    }
});

// New Chat Modal functions
function showNewChatModal() {
    showModal('new-chat-modal');
    
    // Setup search functionality
    const searchInput = document.getElementById('user-search');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                searchUsers(query);
            } else {
                document.getElementById('users-list').innerHTML = '<p>Type at least 2 characters to search</p>';
            }
        }, 300);
    });
}

async function searchUsers(query) {
    try {
        const response = await fetch(`${window.authManager.apiUrl}/users/search?q=${encodeURIComponent(query)}`, {
            headers: window.authManager.getAuthHeader()
        });
        
        if (response.ok) {
            const data = await response.json();
            renderUsersList(data.users);
        } else {
            console.error('Failed to search users');
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

function renderUsersList(users) {
    const usersList = document.getElementById('users-list');
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users found</p>';
        return;
    }
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div class="chat-avatar">
                ${user.avatar ? 
                    `<img src="http://localhost:5000${user.avatar}" alt="${user.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                    user.username.charAt(0).toUpperCase()
                }
            </div>
            <div class="chat-info">
                <div class="chat-name">${user.username}</div>
                <div class="chat-preview">${user.bio || 'No bio'}</div>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            startDirectChat(user);
        });
        
        usersList.appendChild(userItem);
    });
}

async function startDirectChat(user) {
    try {
        const response = await fetch(`${window.authManager.apiUrl}/chats`, {
            method: 'POST',
            headers: {
                ...window.authManager.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                participantId: user._id,
                isGroupChat: false
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeModal('new-chat-modal');
            
            // Add or update chat in the list
            if (window.chatApp) {
                await window.chatApp.loadChats();
                // Select the chat
                const chat = window.chatApp.chats.find(c => c._id === data.chat._id);
                if (chat) {
                    window.chatApp.selectChat(chat);
                }
            }
            
            if (data.message === 'Chat already exists') {
                showNotification('Opened existing chat', 'info');
            } else {
                showNotification('New chat created', 'success');
            }
        } else {
            showNotification(data.message || 'Failed to create chat', 'error');
        }
    } catch (error) {
        console.error('Create chat error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// File upload functions
function showAttachMenu() {
    const menu = document.getElementById('attach-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function selectFile(type) {
    const input = document.getElementById('file-input');
    if (input) {
        if (type === 'image') {
            input.accept = 'image/*';
        } else {
            input.accept = '*';
        }
        input.click();
    }
    
    // Hide attach menu
    const menu = document.getElementById('attach-menu');
    if (menu) {
        menu.classList.add('hidden');
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        for (let file of files) {
            uploadFile(file);
        }
    }
}

async function uploadFile(file) {
    if (!window.chatApp || !window.chatApp.currentChatId) {
        showNotification('Please select a chat first', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', window.chatApp.currentChatId);
        
        const response = await fetch(`${window.authManager.apiUrl}/messages/upload`, {
            method: 'POST',
            headers: window.authManager.getAuthHeader(),
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const message = data.data;
            
            // Add to local messages
            if (!window.chatApp.messages[window.chatApp.currentChatId]) {
                window.chatApp.messages[window.chatApp.currentChatId] = [];
            }
            window.chatApp.messages[window.chatApp.currentChatId].push(message);
            
            // Render message
            const messageElement = window.chatApp.createMessageElement(message);
            document.getElementById('messages-list').appendChild(messageElement);
            
            // Emit via socket
            if (window.chatApp.socket && window.chatApp.socket.connected) {
                window.chatApp.socket.emit('send-message', {
                    ...message,
                    chatId: window.chatApp.currentChatId
                });
            }
            
            window.chatApp.scrollToBottom();
            window.chatApp.updateChatInList(message);
            
            showNotification('File sent successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to upload file', 'error');
        }
    } catch (error) {
        console.error('File upload error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Utility functions for file handling
function openImageViewer(imageSrc) {
    // Create image viewer modal
    const viewer = document.createElement('div');
    viewer.className = 'modal';
    viewer.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%; padding: 0; background: transparent; box-shadow: none;">
            <img src="${imageSrc}" style="width: 100%; height: auto; max-height: 90vh; object-fit: contain; border-radius: 8px;">
            <button class="close-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add click handlers
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer || e.target.classList.contains('close-btn') || e.target.parentElement.classList.contains('close-btn')) {
            document.body.removeChild(viewer);
            document.body.style.overflow = 'auto';
        }
    });
    
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
}

function downloadFile(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Search functionality
function searchInChat() {
    // This could be implemented to search within the current chat
    showNotification('Search in chat - Feature coming soon!', 'info');
}

function showChatInfo() {
    // This could show chat details, participants, etc.
    showNotification('Chat info - Feature coming soon!', 'info');
}

// Voice message (placeholder)
function recordVoice() {
    showNotification('Voice messages - Feature coming soon!', 'info');
}

// Mobile responsive functions
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Handle clicks outside modals and menus
document.addEventListener('click', (e) => {
    // Close attach menu when clicking outside
    const attachMenu = document.getElementById('attach-menu');
    const attachBtn = document.querySelector('.attach-btn');
    
    if (attachMenu && !attachMenu.classList.contains('hidden') && 
        !attachMenu.contains(e.target) && e.target !== attachBtn) {
        attachMenu.classList.add('hidden');
    }
    
    // Close emoji picker when clicking outside
    const emojiPicker = document.getElementById('emoji-picker');
    const emojiBtn = document.getElementById('emoji-btn');
    
    if (emojiPicker && !emojiPicker.classList.contains('hidden') && 
        !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add('hidden');
    }
});

// Handle escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close open modals
        const openModals = document.querySelectorAll('.modal:not(.hidden)');
        openModals.forEach(modal => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
        
        // Close menus
        const attachMenu = document.getElementById('attach-menu');
        if (attachMenu && !attachMenu.classList.contains('hidden')) {
            attachMenu.classList.add('hidden');
        }
        
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker && !emojiPicker.classList.contains('hidden')) {
            emojiPicker.classList.add('hidden');
        }
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});