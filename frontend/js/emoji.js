// Emoji Picker Module

const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
    people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋'],
    nature: ['🌱', '🌿', '🍀', '🍃', '🌾', '🌵', '🌴', '🌳', '🌲', '🌟', '🌞', '🌝', '🌚', '🌜', '🌛', '🌔', '🌓', '🌒', '🌑', '🌘', '🌗', '🌖', '🌕', '💫', '⭐', '🌟', '✨', '☄️', '🌙', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌈', '☂️', '☔'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧇', '🥞', '🧈', '🍯', '🥚', '🧀', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚁', '🛸', '🚟', '🚠', '🚡', '🛩️', '✈️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘'],
    objects: ['💡', '🔦', '🕯️', '🪔', '🔥', '🧨', '🎆', '🎇', '✨', '🎉', '🎊', '🎈', '🎁', '🎀', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🪃', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪀', '🎱', '🔮', '🪄', '🎮', '🕹️', '🎰', '🎲', '🧩', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️']
};

class EmojiPicker {
    constructor() {
        this.currentCategory = 'smileys';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Category buttons
        document.addEventListener('DOMContentLoaded', () => {
            const categoryButtons = document.querySelectorAll('.emoji-category');
            categoryButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    this.switchCategory(category);
                });
            });

            // Load default category
            this.loadCategory(this.currentCategory);
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Load category emojis
        this.loadCategory(category);
    }

    loadCategory(category) {
        const emojiGrid = document.getElementById('emoji-grid');
        if (!emojiGrid) return;

        const emojis = emojiCategories[category] || [];
        
        emojiGrid.innerHTML = '';
        
        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-item';
            emojiButton.textContent = emoji;
            emojiButton.title = emoji;
            
            emojiButton.addEventListener('click', () => {
                this.insertEmoji(emoji);
            });
            
            emojiGrid.appendChild(emojiButton);
        });
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            const text = messageInput.value;
            
            // Insert emoji at cursor position
            const before = text.substring(0, start);
            const after = text.substring(end);
            messageInput.value = before + emoji + after;
            
            // Update cursor position
            const newPosition = start + emoji.length;
            messageInput.selectionStart = newPosition;
            messageInput.selectionEnd = newPosition;
            
            // Focus back to input and trigger input event for auto-resize
            messageInput.focus();
            messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Hide emoji picker
        this.hide();
    }

    show() {
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker) {
            emojiPicker.classList.remove('hidden');
            
            // Load current category if grid is empty
            const emojiGrid = document.getElementById('emoji-grid');
            if (emojiGrid && emojiGrid.children.length === 0) {
                this.loadCategory(this.currentCategory);
            }
        }
    }

    hide() {
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker) {
            emojiPicker.classList.add('hidden');
        }
    }

    toggle() {
        const emojiPicker = document.getElementById('emoji-picker');
        if (emojiPicker) {
            if (emojiPicker.classList.contains('hidden')) {
                this.show();
            } else {
                this.hide();
            }
        }
    }
}

// Global emoji picker instance
const emojiPicker = new EmojiPicker();

// Global function for emoji button
function showEmojiPicker() {
    emojiPicker.toggle();
}

// Message reactions functionality
class MessageReactions {
    constructor() {
        this.commonEmojis = ['❤️', '👍', '👎', '😂', '😢', '😡', '👏', '🔥'];
    }

    async addReaction(messageId, emoji) {
        try {
            const response = await fetch(`${window.authManager.apiUrl}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    ...window.authManager.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emoji })
            });

            const data = await response.json();

            if (response.ok) {
                this.updateMessageReactions(messageId, data.reactions);
                showNotification('Reaction added', 'success');
            } else {
                showNotification(data.message || 'Failed to add reaction', 'error');
            }
        } catch (error) {
            console.error('Add reaction error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }

    async removeReaction(messageId, emoji) {
        try {
            const response = await fetch(`${window.authManager.apiUrl}/messages/${messageId}/reactions`, {
                method: 'DELETE',
                headers: {
                    ...window.authManager.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emoji })
            });

            const data = await response.json();

            if (response.ok) {
                this.updateMessageReactions(messageId, data.reactions);
                showNotification('Reaction removed', 'info');
            } else {
                showNotification(data.message || 'Failed to remove reaction', 'error');
            }
        } catch (error) {
            console.error('Remove reaction error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }

    updateMessageReactions(messageId, reactions) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        // Remove existing reactions display
        const existingReactions = messageElement.querySelector('.message-reactions');
        if (existingReactions) {
            existingReactions.remove();
        }

        if (!reactions || reactions.length === 0) {
            return;
        }

        // Group reactions by emoji
        const reactionGroups = {};
        reactions.forEach(reaction => {
            if (!reactionGroups[reaction.emoji]) {
                reactionGroups[reaction.emoji] = [];
            }
            reactionGroups[reaction.emoji].push(reaction);
        });

        // Create reactions display
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        reactionsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            margin-top: 0.5rem;
        `;

        Object.entries(reactionGroups).forEach(([emoji, reactionList]) => {
            const reactionButton = document.createElement('button');
            reactionButton.className = 'reaction-button';
            reactionButton.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 12px;
                background: var(--surface-color);
                color: var(--text-primary);
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            `;

            const currentUser = window.authManager.getCurrentUser();
            const hasUserReacted = reactionList.some(r => r.user._id === currentUser.id);
            
            if (hasUserReacted) {
                reactionButton.style.background = 'var(--primary-color)';
                reactionButton.style.color = 'white';
                reactionButton.style.borderColor = 'var(--primary-color)';
            }

            reactionButton.innerHTML = `${emoji} ${reactionList.length}`;
            
            reactionButton.addEventListener('click', () => {
                if (hasUserReacted) {
                    this.removeReaction(messageId, emoji);
                } else {
                    this.addReaction(messageId, emoji);
                }
            });

            // Hover effects
            reactionButton.addEventListener('mouseenter', () => {
                if (!hasUserReacted) {
                    reactionButton.style.background = 'var(--border-color)';
                }
            });

            reactionButton.addEventListener('mouseleave', () => {
                if (!hasUserReacted) {
                    reactionButton.style.background = 'var(--surface-color)';
                }
            });

            reactionsContainer.appendChild(reactionButton);
        });

        // Insert reactions after message content
        const messageBubble = messageElement.querySelector('.message-bubble');
        if (messageBubble) {
            messageBubble.appendChild(reactionsContainer);
        }
    }

    showReactionPicker(messageId, x, y) {
        // Remove existing picker
        const existingPicker = document.querySelector('.reaction-picker');
        if (existingPicker) {
            existingPicker.remove();
        }

        // Create reaction picker
        const picker = document.createElement('div');
        picker.className = 'reaction-picker';
        picker.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y - 60}px;
            background: var(--sidebar-color);
            border: 1px solid var(--border-color);
            border-radius: 25px;
            padding: 0.5rem;
            box-shadow: 0 5px 15px var(--shadow);
            z-index: 1000;
            display: flex;
            gap: 0.25rem;
            animation: modalSlide 0.2s ease-out;
        `;

        this.commonEmojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'reaction-emoji';
            emojiButton.textContent = emoji;
            emojiButton.style.cssText = `
                width: 32px;
                height: 32px;
                border: none;
                background: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                transition: all 0.3s ease;
            `;

            emojiButton.addEventListener('click', () => {
                this.addReaction(messageId, emoji);
                picker.remove();
            });

            emojiButton.addEventListener('mouseenter', () => {
                emojiButton.style.background = 'var(--surface-color)';
                emojiButton.style.transform = 'scale(1.2)';
            });

            emojiButton.addEventListener('mouseleave', () => {
                emojiButton.style.background = 'none';
                emojiButton.style.transform = 'scale(1)';
            });

            picker.appendChild(emojiButton);
        });

        document.body.appendChild(picker);

        // Remove picker when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removePicker(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', removePicker);
                }
            });
        }, 100);
    }
}

// Global message reactions instance
const messageReactions = new MessageReactions();

// Add context menu to messages for reactions
document.addEventListener('contextmenu', (e) => {
    const messageElement = e.target.closest('.message');
    if (messageElement) {
        e.preventDefault();
        const messageId = messageElement.dataset.messageId;
        if (messageId) {
            messageReactions.showReactionPicker(messageId, e.clientX, e.clientY);
        }
    }
});

// Add double-click for quick heart reaction
document.addEventListener('dblclick', (e) => {
    const messageElement = e.target.closest('.message');
    if (messageElement) {
        const messageId = messageElement.dataset.messageId;
        if (messageId) {
            messageReactions.addReaction(messageId, '❤️');
        }
    }
});