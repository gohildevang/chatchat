// Notification System

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 seconds
        
        this.ensureContainer();
    }

    ensureContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = null) {
        if (!message) return;

        const notification = this.createNotification(message, type, duration);
        this.addNotification(notification);
        
        return notification;
    }

    createNotification(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Generate unique ID
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        notification.id = id;
        
        // Get icon based on type
        const icon = this.getIcon(type);
        
        // Create notification content
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="notificationManager.remove('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Style the close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.3s ease;
            opacity: 0.7;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'var(--surface-color)';
            closeBtn.style.opacity = '1';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
            closeBtn.style.opacity = '0.7';
        });

        // Auto-remove after duration
        const finalDuration = duration !== null ? duration : this.defaultDuration;
        if (finalDuration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, finalDuration);
        }

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        return icons[type] || icons.info;
    }

    addNotification(notification) {
        const container = this.ensureContainer();
        
        // Remove oldest notification if we've reached the limit
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            if (oldest && oldest.parentNode) {
                this.removeElement(oldest);
            }
        }

        // Add to notifications array
        this.notifications.push(notification);
        
        // Add to DOM with animation
        container.appendChild(notification);
        
        // Trigger slide-in animation
        requestAnimationFrame(() => {
            notification.classList.add('slide-in-right');
        });
    }

    remove(id) {
        const notification = document.getElementById(id);
        if (notification) {
            this.removeElement(notification);
            
            // Remove from notifications array
            this.notifications = this.notifications.filter(n => n.id !== id);
        }
    }

    removeElement(element) {
        if (!element || !element.parentNode) return;
        
        // Add fade-out animation
        element.style.transition = 'all 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }

    clear() {
        this.notifications.forEach(notification => {
            if (notification && notification.parentNode) {
                this.removeElement(notification);
            }
        });
        this.notifications = [];
    }

    success(message, duration = null) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = null) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = null) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = null) {
        return this.show(message, 'info', duration);
    }

    // Utility method to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global notification manager instance
const notificationManager = new NotificationManager();

// Global convenience function
function showNotification(message, type = 'info', duration = null) {
    return notificationManager.show(message, type, duration);
}

// Additional convenience functions
function showSuccess(message, duration = null) {
    return notificationManager.success(message, duration);
}

function showError(message, duration = null) {
    return notificationManager.error(message, duration);
}

function showWarning(message, duration = null) {
    return notificationManager.warning(message, duration);
}

function showInfo(message, duration = null) {
    return notificationManager.info(message, duration);
}

// Browser notification support
class BrowserNotificationManager {
    constructor() {
        this.permission = 'default';
        this.checkPermission();
    }

    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                return this.permission;
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return 'denied';
            }
        }
        return this.permission;
    }

    show(title, options = {}) {
        if (this.permission !== 'granted') {
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: options.icon || '/favicon.ico',
                body: options.body || '',
                tag: options.tag || 'telegram-chat',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                ...options
            });

            // Auto-close after specified time
            if (options.autoClose !== false) {
                const duration = options.duration || 5000;
                setTimeout(() => {
                    notification.close();
                }, duration);
            }

            return notification;
        } catch (error) {
            console.error('Error showing browser notification:', error);
            return null;
        }
    }

    showMessageNotification(sender, message, options = {}) {
        return this.show(`New message from ${sender}`, {
            body: message,
            icon: options.avatar || '/favicon.ico',
            tag: `message-${sender}`,
            requireInteraction: false,
            ...options
        });
    }
}

// Global browser notification manager
const browserNotificationManager = new BrowserNotificationManager();

// Auto-request permission when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission after a short delay to avoid being intrusive
    setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            // Only request if user hasn't been asked before or explicitly denied
            browserNotificationManager.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Browser notifications enabled');
                } else {
                    console.log('Browser notifications disabled');
                }
            });
        }
    }, 2000);
});

// Export for use in other modules
window.showNotification = showNotification;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.notificationManager = notificationManager;
window.browserNotificationManager = browserNotificationManager;