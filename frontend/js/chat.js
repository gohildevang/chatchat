// Chat Manager Class
class ChatManager {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.socket = null;
        this.currentChatId = null;
        this.currentChat = null;
        this.chats = [];
        this.messages = {};
        this.typingUsers = new Set();
        this.onlineUsers = new Set();
        
        this.initializeSocketConnection();
    }

    initialize() {
        if (!window.authManager.isAuthenticated()) {
            return;
        }

        this.updateUserProfile();
        this.loadChats();
        this.initializeMessageInput();
        this.connectSocket();
    }

    initializeSocketConnection() {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io('http://localhost:5000', {
            autoConnect: false
        });

        // Socket event listeners
        this.socket.on('connect', () => {
            console.log('Connected to server');
            const user = window.authManager.getCurrentUser();
            if (user) {
                this.socket.emit('join', user.id);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('receive-message', (data) => {
            this.handleNewMessage(data);
        });

        this.socket.on('user-typing', (data) => {
            this.handleUserTyping(data);
        });

        this.socket.on('user-online', (userId) => {
            this.onlineUsers.add(userId);
            this.updateUserOnlineStatus(userId, true);
        });

        this.socket.on('user-offline', (userId) => {
            this.onlineUsers.delete(userId);
            this.updateUserOnlineStatus(userId, false);
        });
    }

    connectSocket() {
        if (this.socket && !this.socket.connected) {
            this.socket.connect();
        }
    }

    updateUserProfile() {
        const user = window.authManager.getCurrentUser();
        if (user) {
            document.getElementById('user-name').textContent = user.username;
            document.getElementById('user-status').textContent = 'Online';
            
            const avatarElement = document.getElementById('user-avatar');
            if (user.avatar) {
                avatarElement.src = `http://localhost:5000${user.avatar}`;
                avatarElement.style.display = 'block';
            } else {
                avatarElement.src = '';
                avatarElement.textContent = user.username.charAt(0).toUpperCase();
                avatarElement.style.display = 'flex';
            }
        }
    }

    async loadChats() {
        try {
            const response = await fetch(`${this.apiUrl}/chats`, {
                headers: {
                    ...window.authManager.getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.chats = data.chats;
                this.renderChatList();
            } else {
                console.error('Failed to load chats');
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    }

    renderChatList() {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';

        if (this.chats.length === 0) {
            chatList.innerHTML = `
                <div class="empty-state">
                    <p>No chats yet. Start a new conversation!</p>
                </div>
            `;
            return;
        }

        this.chats.forEach(chat => {
            const chatElement = this.createChatElement(chat);
            chatList.appendChild(chatElement);
        });
    }

    createChatElement(chat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat._id;

        const user = window.authManager.getCurrentUser();
        let chatName, chatAvatar;
        
        if (chat.isGroupChat) {
            chatName = chat.name;
            chatAvatar = chat.chatImage || '';
        } else {
            // Find the other participant for direct chat
            const otherParticipant = chat.participants.find(p => p._id !== user.id);
            chatName = otherParticipant ? otherParticipant.username : 'Unknown User';
            chatAvatar = otherParticipant ? otherParticipant.avatar : '';
        }

        const lastMessage = chat.lastMessage;
        const messagePreview = lastMessage ? 
            (lastMessage.messageType === 'text' ? 
                lastMessage.content : 
                `📎 ${lastMessage.messageType}`) : 
            'No messages yet';

        const messageTime = lastMessage ? 
            this.formatTime(new Date(lastMessage.createdAt)) : '';

        chatItem.innerHTML = `
            <div class="chat-avatar">
                ${chatAvatar ? 
                    `<img src="http://localhost:5000${chatAvatar}" alt="${chatName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                    chatName.charAt(0).toUpperCase()
                }
            </div>
            <div class="chat-info">
                <div class="chat-header-info">
                    <div class="chat-name">${chatName}</div>
                    <div class="chat-time">${messageTime}</div>
                </div>
                <div class="chat-preview">${messagePreview}</div>
            </div>
        `;

        chatItem.addEventListener('click', () => {
            this.selectChat(chat);
        });

        return chatItem;
    }

    async selectChat(chat) {
        // Update active chat styling
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-chat-id="${chat._id}"]`).classList.add('active');

        this.currentChat = chat;
        this.currentChatId = chat._id;

        // Join the chat room
        if (this.socket && this.socket.connected) {
            this.socket.emit('join-chat', chat._id);
        }

        // Show chat interface
        this.showChatInterface();
        this.updateChatHeader();
        
        // Load messages for this chat
        await this.loadMessages(chat._id);
    }

    showChatInterface() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('chat-header').classList.remove('hidden');
        document.getElementById('messages-container').classList.remove('hidden');
        document.getElementById('message-input-container').classList.remove('hidden');
    }

    updateChatHeader() {
        if (!this.currentChat) return;

        const user = window.authManager.getCurrentUser();
        let chatName, chatAvatar, chatStatus;

        if (this.currentChat.isGroupChat) {
            chatName = this.currentChat.name;
            chatAvatar = this.currentChat.chatImage || '';
            chatStatus = `${this.currentChat.participants.length} members`;
        } else {
            const otherParticipant = this.currentChat.participants.find(p => p._id !== user.id);
            chatName = otherParticipant ? otherParticipant.username : 'Unknown User';
            chatAvatar = otherParticipant ? otherParticipant.avatar : '';
            
            const isOnline = this.onlineUsers.has(otherParticipant?._id);
            chatStatus = isOnline ? 'Online' : 'Last seen recently';
        }

        document.getElementById('chat-name').textContent = chatName;
        document.getElementById('chat-status').textContent = chatStatus;

        const avatarElement = document.getElementById('chat-avatar');
        if (chatAvatar) {
            avatarElement.src = `http://localhost:5000${chatAvatar}`;
            avatarElement.style.display = 'block';
        } else {
            avatarElement.src = '';
            avatarElement.textContent = chatName.charAt(0).toUpperCase();
            avatarElement.style.display = 'flex';
        }
    }

    async loadMessages(chatId) {
        try {
            const response = await fetch(`${this.apiUrl}/messages/${chatId}`, {
                headers: {
                    ...window.authManager.getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.messages[chatId] = data.messages;
                this.renderMessages(data.messages);
            } else {
                console.error('Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages(messages) {
        const messagesList = document.getElementById('messages-list');
        messagesList.innerHTML = '';

        if (messages.length === 0) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesList.appendChild(messageElement);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const user = window.authManager.getCurrentUser();
        const isOwn = message.sender._id === user.id;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = message._id;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        let content = '';

        // Add sender name for group chats and received messages
        if (!isOwn && this.currentChat && this.currentChat.isGroupChat) {
            content += `<div class="message-sender">${message.sender.username}</div>`;
        }

        // Message content based on type
        if (message.messageType === 'text') {
            content += `<div class="message-content">${this.escapeHtml(message.content)}</div>`;
        } else if (message.messageType === 'image') {
            content += `
                <div class="message-image-container">
                    <img src="http://localhost:5000${message.image.path}" 
                         alt="${message.image.originalName}" 
                         class="message-image"
                         onclick="openImageViewer('http://localhost:5000${message.image.path}')">
                    ${message.content ? `<div class="message-content">${this.escapeHtml(message.content)}</div>` : ''}
                </div>
            `;
        } else if (message.messageType === 'file') {
            content += `
                <div class="message-file" onclick="downloadFile('http://localhost:5000${message.file.path}', '${message.file.originalName}')">
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${message.file.originalName}</div>
                        <div class="file-size">${this.formatFileSize(message.file.size)}</div>
                    </div>
                </div>
                ${message.content ? `<div class="message-content">${this.escapeHtml(message.content)}</div>` : ''}
            `;
        }

        // Message time and status
        const time = this.formatTime(new Date(message.createdAt));
        const isRead = message.readBy && message.readBy.length > 1; // More than just sender
        const statusIcon = isOwn ? (isRead ? '✓✓' : '✓') : '';

        content += `
            <div class="message-time">
                ${time}
                ${isOwn ? `<span class="message-status ${isRead ? 'read' : 'delivered'}">${statusIcon}</span>` : ''}
            </div>
        `;

        bubble.innerHTML = content;
        messageDiv.appendChild(bubble);

        return messageDiv;
    }

    initializeMessageInput() {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-btn');
        
        let typingTimer;
        let isTyping = false;

        messageInput.addEventListener('input', () => {
            this.autoResizeTextarea(messageInput);
            
            // Handle typing indicator
            if (this.currentChatId && this.socket && this.socket.connected) {
                if (!isTyping) {
                    isTyping = true;
                    this.socket.emit('typing', { chatId: this.currentChatId, isTyping: true });
                }
                
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    isTyping = false;
                    this.socket.emit('typing', { chatId: this.currentChatId, isTyping: false });
                }, 1000);
            }
        });

        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();

        if (!content || !this.currentChatId) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    ...window.authManager.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatId: this.currentChatId,
                    content: content
                })
            });

            if (response.ok) {
                const data = await response.json();
                const message = data.data;
                
                // Add message to local storage
                if (!this.messages[this.currentChatId]) {
                    this.messages[this.currentChatId] = [];
                }
                this.messages[this.currentChatId].push(message);
                
                // Render the new message
                const messageElement = this.createMessageElement(message);
                document.getElementById('messages-list').appendChild(messageElement);
                
                // Emit via socket for real-time
                if (this.socket && this.socket.connected) {
                    this.socket.emit('send-message', {
                        ...message,
                        chatId: this.currentChatId
                    });
                }
                
                // Clear input and scroll to bottom
                messageInput.value = '';
                this.autoResizeTextarea(messageInput);
                this.scrollToBottom();
                
                // Update chat list
                this.updateChatInList(message);
                
            } else {
                const data = await response.json();
                showNotification(data.message || 'Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }

    handleNewMessage(data) {
        // Don't handle our own messages (already handled in sendMessage)
        const user = window.authManager.getCurrentUser();
        if (data.sender._id === user.id) {
            return;
        }

        // Add to messages array
        if (!this.messages[data.chatId]) {
            this.messages[data.chatId] = [];
        }
        this.messages[data.chatId].push(data);

        // If this is the current chat, render the message
        if (data.chatId === this.currentChatId) {
            const messageElement = this.createMessageElement(data);
            document.getElementById('messages-list').appendChild(messageElement);
            this.scrollToBottom();
        }

        // Update chat list
        this.updateChatInList(data);
        
        // Show notification if not current chat
        if (data.chatId !== this.currentChatId) {
            this.showMessageNotification(data);
        }
    }

    handleUserTyping(data) {
        const typingIndicator = document.getElementById('typing-indicator');
        const typingText = document.getElementById('typing-text');
        
        if (data.chatId !== this.currentChatId) return;
        
        if (data.isTyping) {
            this.typingUsers.add(data.userId);
        } else {
            this.typingUsers.delete(data.userId);
        }
        
        if (this.typingUsers.size > 0) {
            typingText.textContent = this.typingUsers.size === 1 ? 
                'Someone is typing...' : 
                `${this.typingUsers.size} people are typing...`;
            typingIndicator.classList.remove('hidden');
        } else {
            typingIndicator.classList.add('hidden');
        }
    }

    updateChatInList(message) {
        // Find and update the chat in the list
        const chatElement = document.querySelector(`[data-chat-id="${message.chat}"]`);
        if (chatElement) {
            const previewElement = chatElement.querySelector('.chat-preview');
            const timeElement = chatElement.querySelector('.chat-time');
            
            if (previewElement) {
                const preview = message.messageType === 'text' ? 
                    message.content : 
                    `📎 ${message.messageType}`;
                previewElement.textContent = preview;
            }
            
            if (timeElement) {
                timeElement.textContent = this.formatTime(new Date(message.createdAt));
            }
            
            // Move chat to top
            const chatList = document.getElementById('chat-list');
            chatList.insertBefore(chatElement, chatList.firstChild);
        }
    }

    updateUserOnlineStatus(userId, isOnline) {
        // Update status in chat header if it's a direct chat with this user
        if (this.currentChat && !this.currentChat.isGroupChat) {
            const user = window.authManager.getCurrentUser();
            const otherParticipant = this.currentChat.participants.find(p => p._id !== user.id);
            
            if (otherParticipant && otherParticipant._id === userId) {
                const statusElement = document.getElementById('chat-status');
                if (statusElement) {
                    statusElement.textContent = isOnline ? 'Online' : 'Last seen recently';
                }
            }
        }
    }

    showMessageNotification(message) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(`New message from ${message.sender.username}`, {
                body: message.messageType === 'text' ? message.content : `Sent a ${message.messageType}`,
                icon: message.sender.avatar ? `http://localhost:5000${message.sender.avatar}` : null
            });
            
            notification.onclick = () => {
                window.focus();
                // Find and select the chat
                const chat = this.chats.find(c => c._id === message.chat);
                if (chat) {
                    this.selectChat(chat);
                }
                notification.close();
            };
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatTime(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat manager
window.chatApp = new ChatManager();